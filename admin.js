// DOM Elements
const loginForm = document.getElementById('loginForm');
const postForm = document.getElementById('post-form');
const postsList = document.getElementById('posts-list');
const logoutBtn = document.getElementById('logout-btn');

// State
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    if (!currentUser && window.location.pathname.endsWith('admin.html')) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    if (window.location.pathname.endsWith('admin-login.html')) {
        // Handle login form submission
        loginForm.addEventListener('submit', handleLogin);
    } else if (window.location.pathname.endsWith('admin.html')) {
        // Handle admin dashboard
        renderPosts();
        postForm.addEventListener('submit', handlePostSubmit);
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Login Handler
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Simple authentication (in a real app, this would be server-side)
    // For demo purposes, using a fixed username/password
    if (username === 'admin' && password === 'Lat1@austini') {
        currentUser = { username: 'admin', authenticated: true };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'admin.html';
    } else {
        errorElement.style.display = 'block';
    }
}

// Logout Handler
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'admin-login.html';
}

// Post Submission Handler
function handlePostSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const imageFile = document.getElementById('post-image').files[0];
    
    // Validate inputs
    if (!title || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    // Validate image if provided
    if (imageFile && !validateImage(imageFile)) {
        return;
    }
    
    // Create post object
    const post = {
        id: Date.now(),
        title: sanitizeHTML(title),
        content: sanitizeHTML(content),
        date: new Date().toISOString()
    };
    
    // Handle image upload
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            post.image = e.target.result; // Base64 image data
            savePost(post);
        };
        reader.readAsDataURL(imageFile);
    } else {
        savePost(post);
    }
}

// Save Post
function savePost(post) {
    posts.push(post);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    postForm.reset();
    renderPosts();
    
    // Show success message
    alert('Post published successfully!');
}

// Render Posts
function renderPosts() {
    if (posts.length === 0) {
        postsList.innerHTML = '<div class="empty-state"><p>No posts yet.</p></div>';
        return;
    }
    
    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    postsList.innerHTML = '';
    sortedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post-item';
        postElement.dataset.id = post.id;
        postElement.innerHTML = `
            <h3 class="post-title">${post.title}</h3>
            <p>${post.content.substring(0, 100)}${post.content.length > 100 ? '...' : ''}</p>
            <p><small>Published: ${new Date(post.date).toLocaleDateString()}</small></p>
            <div class="post-actions">
                <button class="edit-btn" data-id="${post.id}">Edit</button>
                <button class="delete-btn" data-id="${post.id}">Delete</button>
            </div>
        `;
        postsList.appendChild(postElement);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            editPost(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.dataset.id);
            deletePost(id);
        });
    });
}

// Edit Post
function editPost(id) {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    // Populate form with post data
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    
    // Remove post from array for editing
    posts = posts.filter(p => p.id !== id);
    
    // Scroll to form
    document.getElementById('post-title').scrollIntoView();
    
    // Change form behavior to update
    postForm.removeEventListener('submit', handlePostSubmit);
    postForm.addEventListener('submit', function updatePost(e) {
        e.preventDefault();
        
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const imageFile = document.getElementById('post-image').files[0];
        
        // Validate inputs
        if (!title || !content) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate image if provided
        if (imageFile && !validateImage(imageFile)) {
            return;
        }
        
        const updatedPost = {
            id: id,
            title: sanitizeHTML(title),
            content: sanitizeHTML(content),
            date: post.date // Keep original date
        };
        
        // Handle image upload
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updatedPost.image = e.target.result; // Base64 image data
                finishEdit(updatedPost);
            };
            reader.readAsDataURL(imageFile);
        } else {
            updatedPost.image = post.image; // Keep existing image
            finishEdit(updatedPost);
        }
    });
    
    // Show update button
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Update Post';
}

// Finish editing
function finishEdit(post) {
    posts.push(post);
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    renderPosts();
    
    // Reset form
    postForm.reset();
    
    // Restore form behavior
    postForm.removeEventListener('submit', handlePostSubmit);
    postForm.addEventListener('submit', handlePostSubmit);
    
    // Restore button text
    const submitBtn = document.querySelector('.submit-btn');
    submitBtn.textContent = 'Publish Post';
    
    alert('Post updated successfully!');
}

// Delete Post
function deletePost(id) {
    if (confirm('Are you sure you want to delete this post?')) {
        posts = posts.filter(post => post.id !== id);
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        renderPosts();
    }
}

// Security: Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Security: Validate image file
function validateImage(file) {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file && !validTypes.includes(file.type)) {
        alert('Invalid file type. Please upload an image (JPEG, PNG, or GIF).');
        return false;
    }
    
    if (file && file.size > maxSize) {
        alert('File size too large. Please upload an image smaller than 5MB.');
        return false;
    }
    
    return true;
}

// Security: Prevent XSS in post rendering
function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}