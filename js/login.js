// Login page functionality
document.addEventListener('DOMContentLoaded', async () => {
    // Check if already logged in
    await auth.init();
    if (auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab;
            if (tabName === 'login') {
                loginForm.style.display = 'flex';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'flex';
            }

            clearMessages();
        });
    });

    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        setLoading(loginForm, true);
        clearMessages();

        const { data, error } = await auth.signIn(email, password);

        if (error) {
            showMessage('error', error.message || 'Login failed. Please check your credentials.');
            setLoading(loginForm, false);
            return;
        }

        showMessage('success', 'Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

    // Signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value;
        const district = document.getElementById('signupDistrict').value.trim();
        const state = document.getElementById('signupState').value.trim();
        const cropsInput = document.getElementById('signupCrops').value.trim();

        // Parse crops into array
        const crops = cropsInput ? cropsInput.split(',').map(c => c.trim()).filter(c => c) : [];

        if (!name) {
            showMessage('error', 'Please enter your name.');
            return;
        }

        if (name.length < 2) {
            showMessage('error', 'Name must be at least 2 characters.');
            return;
        }

        if (password.length < 6) {
            showMessage('error', 'Password must be at least 6 characters.');
            return;
        }

        setLoading(signupForm, true);
        clearMessages();

        try {
            // Step 1: Create auth user
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password,
            });

            if (authError) {
                throw authError;
            }

            if (!authData.user) {
                throw new Error('Signup failed. Please try again.');
            }

            console.log('Auth signup successful, user ID:', authData.user.id);

            // Step 2: Create profile in profiles table
            const profileData = {
                id: authData.user.id,
                name: name,
                district: district || null,
                state: state || null,
                crops: crops.length > 0 ? crops : []
            };

            // Use upsert to handle any edge cases
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .upsert(profileData, { onConflict: 'id' });

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Show warning but don't fail - auth was successful
                showMessage('success', 'Account created! Profile setup may complete on first login. Please check your email to verify your account.');
            } else {
                console.log('Profile created successfully:', profileData);
                showMessage('success', 'Account created successfully! Please check your email to verify your account, then login.');
            }

            setLoading(signupForm, false);

            // Clear form
            signupForm.reset();

            // Switch to login tab after delay
            setTimeout(() => {
                document.querySelector('[data-tab="login"]').click();
            }, 3000);

        } catch (error) {
            console.error('Signup error:', error);
            showMessage('error', error.message || 'Signup failed. Please try again.');
            setLoading(signupForm, false);
        }
    });
});

// Helper: Show message
function showMessage(type, message) {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = message;
    messageEl.className = `auth-message ${type}`;
}

// Helper: Clear messages
function clearMessages() {
    const messageEl = document.getElementById('authMessage');
    messageEl.textContent = '';
    messageEl.className = 'auth-message';
}

// Helper: Set loading state
function setLoading(form, isLoading) {
    const button = form.querySelector('button[type="submit"]');
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');

    button.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';

    // Disable all inputs
    form.querySelectorAll('input').forEach(input => {
        input.disabled = isLoading;
    });
}
