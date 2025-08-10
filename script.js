// DOM Elements
const postsContainer = document.getElementById('posts-container');

// State
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    renderPosts();
});

// Functions
function renderPosts() {
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="empty-state"><p>No blog posts yet. Check back later!</p></div>';
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    postsContainer.innerHTML = '';
    sortedPosts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'post-card';
        postElement.innerHTML = `
            ${post.image ? `<img src="${post.image}" alt="${post.title}" class="post-image">` : ''}
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <p class="post-date">${new Date(post.date).toLocaleDateString()}</p>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

// Security: Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Expose posts for debugging (in a real app, this would be more secure)
window.getPosts = function() {
    return posts;
};