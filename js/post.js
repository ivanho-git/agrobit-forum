// Single Post page functionality
let currentPostId = null;
let currentPostOwnerId = null;
let currentPostTitle = null;
let currentBestReplyId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();

    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPostId = urlParams.get('id');

    if (!currentPostId) {
        showNotFound();
        return;
    }

    await loadPost();
    await loadReplies();
    setupReplyForm();
});

// Load single post
async function loadPost() {
    const loadingEl = document.getElementById('postLoading');
    const postDetailEl = document.getElementById('postDetail');

    try {
        const { data: post, error } = await supabaseClient
            .from('posts')
            .select(`
                *,
                profiles:user_id (name),
                categories:category_id (name)
            `)
            .eq('id', currentPostId)
            .single();

        if (error) throw error;

        if (!post) {
            showNotFound();
            return;
        }

        // Store post owner ID, title, and best reply ID
        currentPostOwnerId = post.user_id;
        currentPostTitle = post.title;
        currentBestReplyId = post.best_reply_id;

        // Update page title
        document.title = `${post.title} - AgroBit Forum`;

        // Populate post details
        document.getElementById('postTitle').textContent = post.title;
        document.getElementById('postDescription').textContent = post.description;
        document.getElementById('postCategory').textContent = post.categories?.name || 'General';
        document.getElementById('postAuthor').textContent = post.profiles?.name || 'Anonymous';
        document.getElementById('postDate').textContent = formatDate(post.created_at);

        // Issue type
        const issueTypeEl = document.getElementById('postIssueType');
        if (post.issue_type) {
            issueTypeEl.textContent = post.issue_type;
            issueTypeEl.style.display = 'inline-block';
        } else {
            issueTypeEl.style.display = 'none';
        }

        // Image
        const imageContainer = document.getElementById('postImageContainer');
        const imageEl = document.getElementById('postImage');
        if (post.image_url) {
            imageEl.src = post.image_url;
            imageContainer.style.display = 'block';
        }

        // AI Suggestion
        const aiSuggestionEl = document.getElementById('aiSuggestion');
        const aiSuggestionText = document.getElementById('aiSuggestionText');
        if (post.ai_suggestion) {
            aiSuggestionText.textContent = post.ai_suggestion;
            aiSuggestionEl.style.display = 'block';
        }

        // Load and display vote count
        await loadPostVotes();

        // Show post detail
        loadingEl.style.display = 'none';
        postDetailEl.style.display = 'block';

        // Show reply form or login prompt
        if (auth.isLoggedIn()) {
            document.getElementById('replyFormContainer').style.display = 'block';
            document.getElementById('loginPrompt').style.display = 'none';
        } else {
            document.getElementById('replyFormContainer').style.display = 'none';
            document.getElementById('loginPrompt').style.display = 'block';
        }

    } catch (error) {
        console.error('Error loading post:', error);
        showNotFound();
    }
}

// Load vote count and user vote status for current post
async function loadPostVotes() {
    try {
        // Get vote count
        const { data: votes, error: voteError } = await supabaseClient
            .from('post_votes')
            .select('id')
            .eq('post_id', currentPostId);

        if (voteError) {
            console.warn('Error loading vote count:', voteError.message);
        }

        const voteCount = votes ? votes.length : 0;

        // Check if current user has voted
        let hasVoted = false;
        if (auth.isLoggedIn()) {
            const { data: userVote } = await supabaseClient
                .from('post_votes')
                .select('id')
                .eq('post_id', currentPostId)
                .eq('user_id', auth.getUser().id)
                .single();

            hasVoted = !!userVote;
        }

        // Update vote section UI
        const voteSection = document.getElementById('postVoteSection');
        if (voteSection) {
            voteSection.innerHTML = `
                <button class="vote-btn vote-btn-large ${hasVoted ? 'voted' : ''}" id="postVoteBtn" title="${hasVoted ? 'Remove vote' : 'Upvote this post'}">
                    <span class="vote-icon">↑</span>
                </button>
                <span class="vote-count vote-count-large" id="postVoteCount">${voteCount}</span>
                <span class="vote-label">votes</span>
            `;

            // Attach event listener
            const voteBtn = document.getElementById('postVoteBtn');
            if (voteBtn) {
                voteBtn.addEventListener('click', handlePostVote);
            }
        }
    } catch (error) {
        console.error('Error loading post votes:', error);
    }
}

// Handle vote on single post page
async function handlePostVote(e) {
    e.preventDefault();

    // Check if user is logged in
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const btn = document.getElementById('postVoteBtn');
    if (!btn) return;

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
                .eq('post_id', currentPostId)
                .eq('user_id', userId);

            if (error) throw error;

            // Update UI
            btn.classList.remove('voted');
            btn.title = 'Upvote this post';
            updatePostVoteCount(-1);
        } else {
            // Add vote
            const { error } = await supabaseClient
                .from('post_votes')
                .insert({
                    post_id: currentPostId,
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
            updatePostVoteCount(1);
        }
    } catch (error) {
        console.error('Error toggling vote:', error);
        alert('Failed to update vote. Please try again.');
    } finally {
        btn.disabled = false;
    }
}

// Update vote count on single post page
function updatePostVoteCount(change) {
    const countEl = document.getElementById('postVoteCount');
    if (countEl) {
        const currentCount = parseInt(countEl.textContent) || 0;
        countEl.textContent = Math.max(0, currentCount + change);
    }
}

// Load replies
async function loadReplies() {
    const repliesListEl = document.getElementById('repliesList');
    const repliesCountEl = document.getElementById('repliesCount');
    const noRepliesEl = document.getElementById('noReplies');

    try {
        // Fetch replies with profile names
        const { data: replies, error } = await supabaseClient
            .from('replies')
            .select(`
                id,
                post_id,
                user_id,
                message,
                created_at,
                profiles (
                    id,
                    name
                )
            `)
            .eq('post_id', currentPostId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        repliesCountEl.textContent = `(${replies?.length || 0})`;

        if (!replies || replies.length === 0) {
            noRepliesEl.style.display = 'block';
            repliesListEl.innerHTML = '';
            return;
        }

        noRepliesEl.style.display = 'none';

        // Sort replies: best answer first, then by created_at
        let sortedReplies = [...replies];
        if (currentBestReplyId) {
            sortedReplies.sort((a, b) => {
                if (a.id === currentBestReplyId) return -1;
                if (b.id === currentBestReplyId) return 1;
                return new Date(a.created_at) - new Date(b.created_at);
            });
        }

        // Check if current user is post owner (to show "Mark as Best" button)
        const isPostOwner = auth.isLoggedIn() && auth.getUser()?.id === currentPostOwnerId;

        const repliesHtml = sortedReplies.map(reply => createReplyCard(reply, isPostOwner)).join('');
        repliesListEl.innerHTML = repliesHtml;

        // Attach event listeners for "Mark as Best" buttons
        attachBestAnswerListeners();

    } catch (error) {
        console.error('Error loading replies:', error);
        repliesListEl.innerHTML = '<div class="no-replies">Error loading replies.</div>';
    }
}

// Create reply card HTML
function createReplyCard(reply, isPostOwner) {
    // Get author name from profiles relation
    const authorName = reply.profiles?.name || 'Anonymous';
    const createdAt = formatDate(reply.created_at);
    const isBestAnswer = reply.id === currentBestReplyId;

    // Show "Mark as Best" button only for post owner and if not already best
    const showMarkBestBtn = isPostOwner && !isBestAnswer;

    return `
        <div class="reply-card ${isBestAnswer ? 'best-answer' : ''}" data-reply-id="${reply.id}">
            ${isBestAnswer ? '<div class="best-badge">🏆 Best Answer</div>' : ''}
            <div class="reply-header">
                <span class="reply-author">
                    <span class="author-icon">👤</span>
                    ${escapeHtml(authorName)}
                </span>
                <div class="reply-actions">
                    ${showMarkBestBtn ? `
                        <button class="mark-best-btn" data-reply-id="${reply.id}" data-user-id="${reply.user_id}" title="Mark as Best Answer">
                            ✓ Mark as Best
                        </button>
                    ` : ''}
                    <span class="reply-date">${createdAt}</span>
                </div>
            </div>
            <p class="reply-message">${escapeHtml(reply.message)}</p>
        </div>
    `;
}

// Attach event listeners to "Mark as Best" buttons
function attachBestAnswerListeners() {
    const buttons = document.querySelectorAll('.mark-best-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const replyId = btn.dataset.replyId;
            const replyUserId = btn.dataset.userId;
            await markAsBestReply(replyId, replyUserId);
        });
    });
}

// Setup reply form
function setupReplyForm() {
    const form = document.getElementById('replyForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const messageInput = document.getElementById('replyMessage');
        const message = messageInput.value.trim();

        if (!message) {
            return;
        }

        setReplyLoading(true);

        try {
            const currentUserId = auth.getUser().id;

            const { error } = await supabaseClient
                .from('replies')
                .insert({
                    post_id: currentPostId,
                    user_id: currentUserId,
                    message: message
                });

            if (error) throw error;

            // Create notification for post owner (if not replying to own post)
            if (currentPostOwnerId && currentPostOwnerId !== currentUserId) {
                await createNotification(
                    currentPostOwnerId,
                    `Someone replied to your post "${truncateText(currentPostTitle, 30)}"`,
                    currentPostId
                );
            }

            // Clear form and reload replies
            messageInput.value = '';
            await loadReplies();

        } catch (error) {
            console.error('Error posting reply:', error);
            alert('Failed to post reply. Please try again.');
        } finally {
            setReplyLoading(false);
        }
    });
}

// Create notification helper
async function createNotification(userId, message, postId) {
    try {
        await supabaseClient
            .from('notifications')
            .insert({
                user_id: userId,
                message: message,
                post_id: postId,
                is_read: false
            });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// Mark reply as best answer
async function markAsBestReply(replyId, replyUserId) {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUserId = auth.getUser().id;

    // Only post owner can mark best reply
    if (currentPostOwnerId !== currentUserId) {
        alert('Only the post author can mark a best answer.');
        return;
    }

    // Disable all mark best buttons while processing
    const buttons = document.querySelectorAll('.mark-best-btn');
    buttons.forEach(btn => btn.disabled = true);

    try {
        // Update the post with best_reply_id
        const { error } = await supabaseClient
            .from('posts')
            .update({ best_reply_id: replyId })
            .eq('id', currentPostId)
            .eq('user_id', currentUserId); // Extra safety: ensure user owns the post

        if (error) throw error;

        // Update local state
        currentBestReplyId = replyId;

        // Create notification for reply author (if not the post owner)
        if (replyUserId && replyUserId !== currentUserId) {
            await createNotification(
                replyUserId,
                `Your reply was marked as the best answer on "${truncateText(currentPostTitle, 30)}"`,
                currentPostId
            );
        }

        // Reload replies to show the update
        await loadReplies();

    } catch (error) {
        console.error('Error marking best reply:', error);
        alert('Failed to mark as best answer. Please try again.');
        // Re-enable buttons on error
        buttons.forEach(btn => btn.disabled = false);
    }
}

// Helper: Truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

// Show not found state
function showNotFound() {
    document.getElementById('postLoading').style.display = 'none';
    document.getElementById('postDetail').style.display = 'none';
    document.getElementById('notFound').style.display = 'block';
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Helper: Set reply loading state
function setReplyLoading(isLoading) {
    const submitBtn = document.getElementById('replySubmitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';

    document.getElementById('replyMessage').disabled = isLoading;
}
