// Homepage - Fetch and display posts
document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();
    await loadCategories();
    await loadPosts();

    // Category filter change handler
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => loadPosts());
    }
});

// Load categories for filter dropdown
async function loadCategories() {
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            console.warn('Error loading categories:', error.message);
            return; // Categories are optional for viewing posts
        }

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter && categories) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load posts from database
async function loadPosts() {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;

    postsContainer.innerHTML = '<div class="loading">Loading posts...</div>';

    try {
        const categoryFilter = document.getElementById('categoryFilter');
        const selectedCategory = categoryFilter?.value;

        // First try with joins
        let query = supabaseClient
            .from('posts')
            .select(`
                *,
                profiles:user_id (name),
                categories:category_id (name)
            `)
            .order('created_at', { ascending: false });

        if (selectedCategory) {
            query = query.eq('category_id', selectedCategory);
        }

        let { data: posts, error } = await query;

        // If join fails due to RLS, try fetching posts without joins
        if (error) {
            console.warn('Join query failed, trying simple query:', error.message);
            const simpleQuery = await supabaseClient
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            posts = simpleQuery.data;
            error = simpleQuery.error;
        }

        if (error) {
            console.error('Database error:', error);
            throw error;
        }

        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="no-posts">
                    <h3>No posts yet</h3>
                    <p>Be the first to start a discussion!</p>
                    ${auth.isLoggedIn() ? '<a href="create.html" class="btn btn-primary" style="margin-top: 1rem;">Create Post</a>' : ''}
                </div>
            `;
            return;
        }

        // Fetch vote counts for all posts
        const postIds = posts.map(p => p.id);
        const { data: voteCounts, error: voteError } = await supabaseClient
            .from('post_votes')
            .select('post_id')
            .in('post_id', postIds);

        if (voteError) {
            console.warn('Error fetching vote counts:', voteError.message);
        }

        // Count votes per post
        const voteCountMap = {};
        if (voteCounts) {
            voteCounts.forEach(vote => {
                voteCountMap[vote.post_id] = (voteCountMap[vote.post_id] || 0) + 1;
            });
        }

        // Check if current user has voted on any posts
        let userVotes = [];
        if (auth.isLoggedIn()) {
            const { data: userVoteData } = await supabaseClient
                .from('post_votes')
                .select('post_id')
                .eq('user_id', auth.getUser().id)
                .in('post_id', postIds);

            userVotes = userVoteData ? userVoteData.map(v => v.post_id) : [];
        }

        // Add vote data to posts
        posts.forEach(post => {
            post.voteCount = voteCountMap[post.id] || 0;
            post.hasVoted = userVotes.includes(post.id);
        });

        postsContainer.innerHTML = posts.map(post => createPostCard(post)).join('');

        // Attach vote event listeners
        attachVoteListeners();

    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="no-posts">
                <h3>Error loading posts</h3>
                <p>${error.message || 'Please try refreshing the page.'}</p>
                <p style="font-size: 0.85rem; color: #888; margin-top: 0.5rem;">Check browser console for details (F12)</p>
            </div>
        `;
    }
}

// Create post card HTML
function createPostCard(post) {
    const authorName = post.profiles?.name || 'Anonymous';
    const categoryName = post.categories?.name || 'General';
    const createdAt = formatDate(post.created_at);
    const preview = truncateText(post.description, 150);
    const voteCount = post.voteCount || 0;
    const hasVoted = post.hasVoted || false;

    return `
        <article class="post-card">
            <div class="post-card-content">
                <div class="post-vote-section">
                    <button class="vote-btn ${hasVoted ? 'voted' : ''}" data-post-id="${post.id}" title="${hasVoted ? 'Remove vote' : 'Upvote'}">
                        <span class="vote-icon">↑</span>
                    </button>
                    <span class="vote-count" id="vote-count-${post.id}">${voteCount}</span>
                </div>
                <div class="post-card-main">
                    <div class="post-card-header">
                        <span class="post-category-badge">${escapeHtml(categoryName)}</span>
                        ${post.issue_type ? `<span class="post-issue-badge">${escapeHtml(post.issue_type)}</span>` : ''}
                    </div>
                    <h2 class="post-card-title">
                        <a href="post.html?id=${post.id}">${escapeHtml(post.title)}</a>
                    </h2>
                    <p class="post-card-preview">${escapeHtml(preview)}</p>
                    ${post.image_url ? `<img src="${escapeHtml(post.image_url)}" alt="Post image" class="post-card-image">` : ''}
                    <div class="post-card-footer">
                        <span class="post-author">
                            <span class="author-icon">👤</span>
                            ${escapeHtml(authorName)}
                        </span>
                        <span class="post-date">${createdAt}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper: Truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Attach vote event listeners to all vote buttons
function attachVoteListeners() {
    const voteButtons = document.querySelectorAll('.vote-btn');
    voteButtons.forEach(btn => {
        btn.addEventListener('click', handleVoteClick);
    });
}

// Handle vote button click
async function handleVoteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;
    const postId = btn.dataset.postId;

    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // Disable button while processing
    btn.disabled = true;

    try {
        const userId = auth.getUser().id;
        const hasVoted = btn.classList.contains('voted');

        if (hasVoted) {
            // Remove vote
            const { error } = await supabaseClient
                .from('post_votes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);

            if (error) throw error;

            // Update UI
            btn.classList.remove('voted');
            btn.title = 'Upvote';
            updateVoteCount(postId, -1);
        } else {
            // Add vote
            const { error } = await supabaseClient
                .from('post_votes')
                .insert({
                    post_id: postId,
                    user_id: userId
                });

            if (error) {
                // Handle duplicate vote error gracefully
                if (error.code === '23505') {
                    console.warn('Already voted');
                    btn.classList.add('voted');
                    return;
                }
                throw error;
            }

            // Update UI
            btn.classList.add('voted');
            btn.title = 'Remove vote';
            updateVoteCount(postId, 1);
        }
    } catch (error) {
        console.error('Error toggling vote:', error);
        alert('Failed to update vote. Please try again.');
    } finally {
        btn.disabled = false;
    }
}

// Update vote count display
function updateVoteCount(postId, change) {
    const countEl = document.getElementById(`vote-count-${postId}`);
    if (countEl) {
        const currentCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = Math.max(0, currentCount + change);
    }
}

