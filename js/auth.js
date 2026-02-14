// Auth utilities
const auth = {
    currentUser: null,
    currentSession: null,
    unreadCount: 0,

    // Initialize auth state
    async init() {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;

            this.currentSession = session;
            this.currentUser = session?.user || null;

            // Listen for auth changes
            supabaseClient.auth.onAuthStateChange((event, session) => {
                this.currentSession = session;
                this.currentUser = session?.user || null;
                this.updateNavbar();
            });

            this.updateNavbar();

            // Load notifications if logged in
            if (this.isLoggedIn()) {
                await this.loadNotifications();
            }

            return this.currentUser;
        } catch (error) {
            console.error('Auth init error:', error);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    },

    // Get current user
    getUser() {
        return this.currentUser;
    },

    // Sign up with email and password
    async signUp(email, password, profileData) {
        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create profile after signup
            // data.user exists even when email confirmation is required
            if (data.user) {
                // Check if profile already exists (in case of re-signup)
                const { data: existingProfile } = await supabaseClient
                    .from('profiles')
                    .select('id')
                    .eq('id', data.user.id)
                    .single();

                if (!existingProfile) {
                    // Use upsert to avoid duplicate key errors
                    const { error: profileError } = await supabaseClient
                        .from('profiles')
                        .upsert({
                            id: data.user.id,
                            name: profileData.name || 'New Farmer',
                            district: profileData.district || null,
                            state: profileData.state || null,
                            crops: profileData.crops || [],
                        }, {
                            onConflict: 'id'
                        });

                    if (profileError) {
                        console.error('Profile creation error:', profileError);
                        // Don't throw - auth succeeded, profile can be created later
                    } else {
                        console.log('Profile created successfully for user:', data.user.id);
                    }
                } else {
                    console.log('Profile already exists for user:', data.user.id);
                }
            }

            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;

            this.currentUser = null;
            this.currentSession = null;
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    },

    // Update navbar based on auth state
    updateNavbar() {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;

        if (this.isLoggedIn()) {
            navLinks.innerHTML = `
                <a href="market.html" class="nav-link">Market Prices</a>
                <a href="profile.html" class="nav-link">My Profile</a>
                <div class="notification-wrapper">
                    <button class="notification-bell" id="notificationBell" onclick="auth.toggleNotifications(event)">
                        🔔
                        <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
                    </button>
                    <div class="notification-dropdown" id="notificationDropdown">
                        <div class="notification-header">
                            <span>Notifications</span>
                            <button class="mark-all-read" onclick="auth.markAllAsRead(event)">Mark all read</button>
                        </div>
                        <div class="notification-list" id="notificationList">
                            <div class="notification-empty">No notifications</div>
                        </div>
                    </div>
                </div>
                <a href="create.html" class="btn btn-primary">+ Create Post</a>
                <button onclick="auth.signOut()" class="btn btn-secondary">Logout</button>
            `;
            this.loadNotifications();
        } else {
            navLinks.innerHTML = `
                <a href="market.html" class="nav-link">Market Prices</a>
                <a href="login.html" class="btn btn-primary">Login</a>
            `;
        }
    },

    // Load notifications for current user
    async loadNotifications() {
        if (!this.isLoggedIn()) return;

        try {
            const { data: notifications, error } = await supabaseClient
                .from('notifications')
                .select('*')
                .eq('user_id', this.getUser().id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            this.renderNotifications(notifications || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    },

    // Render notifications in dropdown
    renderNotifications(notifications) {
        const listEl = document.getElementById('notificationList');
        const badgeEl = document.getElementById('notificationBadge');

        if (!listEl || !badgeEl) return;

        const unreadCount = notifications.filter(n => !n.is_read).length;
        this.unreadCount = unreadCount;

        // Update badge
        if (unreadCount > 0) {
            badgeEl.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badgeEl.style.display = 'flex';
        } else {
            badgeEl.style.display = 'none';
        }

        // Render list
        if (notifications.length === 0) {
            listEl.innerHTML = '<div class="notification-empty">No notifications</div>';
            return;
        }

        listEl.innerHTML = notifications.map(n => `
            <div class="notification-item ${n.is_read ? '' : 'unread'}"
                 data-id="${n.id}"
                 data-post-id="${n.post_id}"
                 onclick="auth.handleNotificationClick('${n.id}', '${n.post_id}')">
                <div class="notification-message">${this.escapeHtml(n.message)}</div>
                <div class="notification-time">${this.formatNotificationTime(n.created_at)}</div>
            </div>
        `).join('');
    },

    // Toggle notification dropdown
    toggleNotifications(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    },

    // Handle notification click
    async handleNotificationClick(notificationId, postId) {
        // Mark as read
        try {
            await supabaseClient
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }

        // Redirect to post
        window.location.href = `post.html?id=${postId}`;
    },

    // Mark all notifications as read
    async markAllAsRead(e) {
        e.stopPropagation();
        if (!this.isLoggedIn()) return;

        try {
            await supabaseClient
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', this.getUser().id)
                .eq('is_read', false);

            await this.loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    },

    // Format notification time
    formatNotificationTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    },

    // Escape HTML helper
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Protect page - redirect to login if not authenticated
    async requireAuth() {
        await this.init();
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Close notification dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('notificationDropdown');
    const bell = document.getElementById('notificationBell');
    if (dropdown && bell && !bell.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize auth when script loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
});
