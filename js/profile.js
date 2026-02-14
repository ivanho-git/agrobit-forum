// Profile page functionality
let currentProfile = null;
let isEditMode = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Require authentication
    await auth.init();

    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    await loadProfile();
    await loadUserStats();
    await loadUserPosts();
    setupEditForm();
});

// Load user profile
async function loadProfile() {
    const loadingEl = document.getElementById('profileLoading');
    const containerEl = document.getElementById('profileContainer');

    try {
        const userId = auth.getUser().id;
        const userEmail = auth.getUser().email;

        // Fetch profile from database
        const { data: profile, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 = no rows returned
            throw error;
        }

        // If no profile exists, create one
        if (!profile) {
            console.log('No profile found, creating one...');
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert({
                    id: userId,
                    name: 'New Farmer',
                    district: null,
                    state: null,
                    crops: []
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating profile:', createError);
                currentProfile = {
                    id: userId,
                    name: 'New Farmer',
                    district: null,
                    state: null,
                    crops: []
                };
            } else {
                currentProfile = newProfile;
            }
        } else {
            currentProfile = profile;
        }

        // Update UI
        displayProfile(currentProfile, userEmail);

        loadingEl.style.display = 'none';
        containerEl.style.display = 'block';

    } catch (error) {
        console.error('Error loading profile:', error);
        loadingEl.innerHTML = 'Error loading profile. Please refresh the page.';
    }
}

// Display profile data
function displayProfile(profile, email) {
    // Header
    document.getElementById('profileName').textContent = profile.name || 'New Farmer';
    document.getElementById('profileEmail').textContent = email || '';
    document.getElementById('profileJoined').textContent = `Member since ${formatDate(profile.created_at)}`;

    // Avatar - first letter of name
    const avatarEl = document.getElementById('profileAvatar');
    if (profile.name) {
        avatarEl.textContent = profile.name.charAt(0).toUpperCase();
    }

    // View mode fields
    document.getElementById('viewName').textContent = profile.name || '-';
    document.getElementById('viewDistrict').textContent = profile.district || '-';
    document.getElementById('viewState').textContent = profile.state || '-';
    document.getElementById('viewCrops').textContent =
        profile.crops && profile.crops.length > 0 ? profile.crops.join(', ') : '-';

    // Edit mode fields (pre-fill)
    document.getElementById('editName').value = profile.name || '';
    document.getElementById('editDistrict').value = profile.district || '';
    document.getElementById('editState').value = profile.state || '';
    document.getElementById('editCrops').value =
        profile.crops && profile.crops.length > 0 ? profile.crops.join(', ') : '';
}

// Load user statistics
async function loadUserStats() {
    try {
        const userId = auth.getUser().id;

        // Count posts
        const { count: postsCount } = await supabaseClient
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Count replies
        const { count: repliesCount } = await supabaseClient
            .from('replies')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Count best answers (replies that are marked as best)
        const { data: bestAnswers } = await supabaseClient
            .from('posts')
            .select('best_reply_id')
            .not('best_reply_id', 'is', null);

        // Get reply IDs by this user
        const { data: userReplies } = await supabaseClient
            .from('replies')
            .select('id')
            .eq('user_id', userId);

        const userReplyIds = userReplies ? userReplies.map(r => r.id) : [];
        const bestAnswerCount = bestAnswers ?
            bestAnswers.filter(p => userReplyIds.includes(p.best_reply_id)).length : 0;

        // Update UI
        document.getElementById('statPosts').textContent = postsCount || 0;
        document.getElementById('statReplies').textContent = repliesCount || 0;
        document.getElementById('statBestAnswers').textContent = bestAnswerCount;

    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load user's recent posts
async function loadUserPosts() {
    const listEl = document.getElementById('userPostsList');

    try {
        const userId = auth.getUser().id;

        const { data: posts, error } = await supabaseClient
            .from('posts')
            .select(`
                id,
                title,
                created_at,
                categories (name)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        if (!posts || posts.length === 0) {
            listEl.innerHTML = '<p class="no-posts-message">You haven\'t created any posts yet.</p>';
            return;
        }

        listEl.innerHTML = posts.map(post => `
            <a href="post.html?id=${post.id}" class="user-post-item">
                <div class="user-post-title">${escapeHtml(post.title)}</div>
                <div class="user-post-meta">
                    <span class="user-post-category">${escapeHtml(post.categories?.name || 'General')}</span>
                    <span class="user-post-date">${formatDate(post.created_at)}</span>
                </div>
            </a>
        `).join('');

    } catch (error) {
        console.error('Error loading user posts:', error);
        listEl.innerHTML = '<p class="no-posts-message">Error loading posts.</p>';
    }
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    const viewMode = document.getElementById('profileViewMode');
    const editMode = document.getElementById('profileEditMode');
    const editBtn = document.getElementById('editProfileBtn');

    if (isEditMode) {
        viewMode.style.display = 'none';
        editMode.style.display = 'flex';
        editBtn.textContent = 'Cancel';
    } else {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        editBtn.textContent = 'Edit Profile';
    }

    clearMessage();
}

// Cancel edit
function cancelEdit() {
    // Reset form values
    if (currentProfile) {
        document.getElementById('editName').value = currentProfile.name || '';
        document.getElementById('editDistrict').value = currentProfile.district || '';
        document.getElementById('editState').value = currentProfile.state || '';
        document.getElementById('editCrops').value =
            currentProfile.crops && currentProfile.crops.length > 0 ? currentProfile.crops.join(', ') : '';
    }
    toggleEditMode();
}

// Setup edit form
function setupEditForm() {
    const form = document.getElementById('profileEditMode');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('editName').value.trim();
        const district = document.getElementById('editDistrict').value.trim();
        const state = document.getElementById('editState').value.trim();
        const cropsInput = document.getElementById('editCrops').value.trim();

        if (!name) {
            showMessage('error', 'Name is required.');
            return;
        }

        const crops = cropsInput ? cropsInput.split(',').map(c => c.trim()).filter(c => c) : [];

        setLoading(true);
        clearMessage();

        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({
                    name: name,
                    district: district || null,
                    state: state || null,
                    crops: crops
                })
                .eq('id', auth.getUser().id)
                .select()
                .single();

            if (error) throw error;

            currentProfile = data;
            displayProfile(currentProfile, auth.getUser().email);
            showMessage('success', 'Profile updated successfully!');

            // Switch back to view mode after delay
            setTimeout(() => {
                toggleEditMode();
            }, 1500);

        } catch (error) {
            console.error('Error updating profile:', error);
            showMessage('error', error.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    });
}

// Helper: Show message
function showMessage(type, message) {
    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
}

// Helper: Clear message
function clearMessage() {
    const messageEl = document.getElementById('profileMessage');
    messageEl.textContent = '';
    messageEl.className = 'form-message';
}

// Helper: Set loading state
function setLoading(isLoading) {
    const saveBtn = document.getElementById('saveProfileBtn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoading = saveBtn.querySelector('.btn-loading');

    saveBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';

    // Disable form inputs
    document.querySelectorAll('#profileEditMode input').forEach(input => {
        input.disabled = isLoading;
    });
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
