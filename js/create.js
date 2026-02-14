// Create Post page functionality
let selectedFile = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Protect page - require authentication
    const isAuthenticated = await auth.requireAuth();
    if (!isAuthenticated) return;

    await loadCategories();
    setupImageUpload();
    setupFormSubmission();
});

// Load categories for dropdown
async function loadCategories() {
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('name');

        if (error) throw error;

        const categorySelect = document.getElementById('postCategory');
        if (categorySelect && categories) {
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showFormMessage('error', 'Failed to load categories. Please refresh the page.');
    }
}

// Setup image upload functionality
function setupImageUpload() {
    const fileInput = document.getElementById('postImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.getElementById('removeImage');

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showFormMessage('error', 'Image size must be less than 5MB');
                fileInput.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showFormMessage('error', 'Please select a valid image file');
                fileInput.value = '';
                return;
            }

            selectedFile = file;

            // Show preview
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeImageBtn.addEventListener('click', () => {
        selectedFile = null;
        fileInput.value = '';
        previewImg.src = '';
        uploadPlaceholder.style.display = 'block';
        imagePreview.style.display = 'none';
    });
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('createPostForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('postTitle').value.trim();
        const categoryId = document.getElementById('postCategory').value;
        const issueType = document.getElementById('postIssueType').value.trim();
        const description = document.getElementById('postDescription').value.trim();

        if (!title || !categoryId || !description) {
            showFormMessage('error', 'Please fill in all required fields.');
            return;
        }

        setLoading(true);
        clearFormMessage();

        try {
            let imageUrl = null;

            // Upload image if selected
            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);
                if (!imageUrl) {
                    throw new Error('Failed to upload image');
                }
            }

            // Insert post
            const { data: post, error } = await supabaseClient
                .from('posts')
                .insert({
                    user_id: auth.getUser().id,
                    category_id: categoryId,
                    title: title,
                    description: description,
                    issue_type: issueType || null,
                    image_url: imageUrl,
                })
                .select()
                .single();

            if (error) throw error;

            showFormMessage('success', 'Post created successfully! Redirecting...');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            console.error('Error creating post:', error);
            showFormMessage('error', error.message || 'Failed to create post. Please try again.');
            setLoading(false);
        }
    });
}

// Upload image to Supabase storage
async function uploadImage(file) {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { data, error } = await supabaseClient.storage
            .from('crop-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
            .from('crop-images')
            .getPublicUrl(filePath);

        return publicUrl;

    } catch (error) {
        console.error('Image upload error:', error);
        return null;
    }
}

// Helper: Show form message
function showFormMessage(type, message) {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
}

// Helper: Clear form message
function clearFormMessage() {
    const messageEl = document.getElementById('formMessage');
    messageEl.textContent = '';
    messageEl.className = 'form-message';
}

// Helper: Set loading state
function setLoading(isLoading) {
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = isLoading;
    btnText.style.display = isLoading ? 'none' : 'inline';
    btnLoading.style.display = isLoading ? 'inline' : 'none';

    // Disable form inputs
    const form = document.getElementById('createPostForm');
    form.querySelectorAll('input, select, textarea').forEach(el => {
        el.disabled = isLoading;
    });
}
