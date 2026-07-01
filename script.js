// ============================================
// 1. API CONFIGURATION (Top of file)
// ============================================

const API_BASE_URL = 'https://qanoon-in-hand-backend.onrender.com/api';

// ============================================
// 2. HELPER FUNCTIONS
// ============================================

// Get token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Get session ID (for guest users)
function getSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        sessionId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
}

// Main API call function
async function apiCall(endpoint, method = 'GET', data = null, token = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Add token if provided
    const authToken = token || getAuthToken();
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'API call failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================
// 3. AUTHENTICATION FUNCTIONS
// ============================================


// ============================================
// 4. ARTICLES FUNCTIONS
// ============================================


// Get All Articles (with optional category filter)
async function getAllArticles(category = '') {
    try {
        let endpoint = '/articles/all';
        if (category) {
            endpoint += `?category=${encodeURIComponent(category)}`;
        }
        const result = await apiCall(endpoint, 'GET');
        return result.articles || [];
    } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
}

// Get Single Article
async function getSingleArticle(articleId) {
    try {
        const result = await apiCall(`/articles/${articleId}`, 'GET');
        return result.article || null;
    } catch (error) {
        console.error('Error fetching article:', error);
        return null;
    }
}

// Get Categories
async function getCategories() {
    try {
        const result = await apiCall('/categories', 'GET');
        return result.categories || [];
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// ============================================
// 5. INTERACTION FUNCTIONS
// ============================================

// Like/Unlike Article
async function toggleLike(articleId) {
    try {
        const sessionId = getSessionId();
        const result = await apiCall(`/articles/like/${articleId}`, 'POST', { sessionId });
        return result;
    } catch (error) {
        console.error('Error toggling like:', error);
        return null;
    }
}

// Add Comment
async function addComment(articleId, userName, comment) {
    try {
        const result = await apiCall(`/articles/comment/${articleId}`, 'POST', { userName, comment });
        if (result.success) {
            alert('✅ Comment added successfully!');
            return result;
        }
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('❌ Failed to add comment');
    }
}

// Get Comments
async function getComments(articleId) {
    try {
        const result = await apiCall(`/articles/comments/${articleId}`, 'GET');
        return result.comments || [];
    } catch (error) {
        console.error('Error fetching comments:', error);
        return [];
    }
}

// Add Rating
async function addRating(articleId, rating) {
    try {
        const sessionId = getSessionId();
        const result = await apiCall(`/articles/rate/${articleId}`, 'POST', { rating, sessionId });
        if (result.success) {
            alert('✅ Rating added successfully!');
            return result;
        }
    } catch (error) {
        console.error('Error adding rating:', error);
        alert('❌ Failed to add rating');
    }
}

// Get Ratings
async function getRatings(articleId) {
    try {
        const result = await apiCall(`/articles/ratings/${articleId}`, 'GET');
        return result.ratings || [];
    } catch (error) {
        console.error('Error fetching ratings:', error);
        return [];
    }
}

// ============================================
// 6. SAVED ARTICLES FUNCTIONS
// ============================================

// Save Article (Requires Authentication)
async function saveArticle(articleId) {
    try {
        const token = getAuthToken();
        if (!token) {
            alert('⚠️ Please login to save articles');
            window.location.href = 'login.html';
            return;
        }
        
        const result = await apiCall(`/articles/save/${articleId}`, 'POST', null, token);
        if (result.success) {
            alert('✅ Article saved successfully!');
            return result;
        }
    } catch (error) {
        console.error('Error saving article:', error);
        alert('❌ Failed to save article');
    }
}

// Get Saved Articles (Requires Authentication)
async function getSavedArticles() {
    try {
        const token = getAuthToken();
        if (!token) {
            return [];
        }
        
        const result = await apiCall('/articles/saved', 'GET', null, token);
        return result.articles || [];
    } catch (error) {
        console.error('Error fetching saved articles:', error);
        return [];
    }
}

// ============================================
// 7. PAGE-SPECIFIC FUNCTIONS
// ============================================

// Function to display articles on legalarticles.html
async function displayArticles(page = 'all', category = '') {
    let articles = [];
    
    if (page === 'featured') {
        articles = await getFeaturedArticles();
    } else if (page === 'saved') {
        articles = await getSavedArticles();
    } else {
        articles = await getAllArticles(category);
    }
    
    const container = document.getElementById('articles-container');
    if (!container) return;
    
    if (articles.length === 0) {
        container.innerHTML = '<p class="no-articles">No articles found</p>';
        return;
    }
    
    container.innerHTML = articles.map(article => `
        <div class="article-card ${article.isFeatured ? 'featured' : ''}">
            <h3>${article.title}</h3>
            <p class="description">${article.description || 'No description'}</p>
            <div class="article-meta">
                <span class="category">${article.category || 'Uncategorized'}</span>
                <span class="author">By: ${article.authorName || 'Unknown'}</span>
                <span class="read-time">${article.readTime || '5'} min read</span>
            </div>
            <div class="interactions">
                <button onclick="viewArticle('${article._id}')">📖 Read More</button>
                <button onclick="toggleLikeAndUpdate('${article._id}')">❤️ Like</button>
                <button onclick="saveArticle('${article._id}')">💾 Save</button>
            </div>
        </div>
    `).join('');
}

// View single article
async function viewArticle(articleId) {
    window.location.href = `article-detail.html?id=${articleId}`;
}

// Load article detail page
async function loadArticleDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
        document.getElementById('article-content').innerHTML = '<p>Article not found</p>';
        return;
    }
    
    const article = await getSingleArticle(articleId);
    if (!article) {
        document.getElementById('article-content').innerHTML = '<p>Article not found</p>';
        return;
    }
    
    // Display article content
    document.getElementById('article-content').innerHTML = `
        <h1>${article.title}</h1>
        <div class="article-meta-detail">
            <span>📝 ${article.category || 'Uncategorized'}</span>
            <span>👤 ${article.authorName || 'Unknown'}</span>
            <span>⏱ ${article.readTime || '5'} min read</span>
        </div>
        <div class="article-body">${article.content || 'Content not available'}</div>
        <div class="interaction-buttons">
            <button onclick="toggleLikeAndUpdate('${article._id}')">❤️ Like</button>
            <button onclick="saveArticle('${article._id}')">💾 Save</button>
        </div>
    `;
    
    // Load comments
    await loadComments(articleId);
    
    // Load ratings
    await loadRatings(articleId);
}

// Load comments on article detail page
async function loadComments(articleId) {
    const comments = await getComments(articleId);
    const container = document.getElementById('comments-container');
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment">
            <strong>${comment.userName || 'Anonymous'}</strong>
            <p>${comment.comment}</p>
            <small>${new Date(comment.createdAt).toLocaleDateString()}</small>
        </div>
    `).join('');
}

// Load ratings on article detail page
async function loadRatings(articleId) {
    const ratings = await getRatings(articleId);
    const container = document.getElementById('rating-display');
    if (!container) return;
    
    if (ratings.length === 0) {
        container.innerHTML = '<p>No ratings yet.</p>';
        return;
    }
    
    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    container.innerHTML = `
        <div class="rating-summary">
            <span class="average-rating">⭐ ${avgRating.toFixed(1)}</span>
            <span class="total-ratings">(${ratings.length} ratings)</span>
        </div>
    `;
}

// Like toggle with UI update
async function toggleLikeAndUpdate(articleId) {
    const result = await toggleLike(articleId);
    if (result) {
        alert(result.message || 'Like toggled!');
    }
}

// Submit comment from article detail page
async function submitComment(articleId) {
    const nameInput = document.getElementById('commenter-name');
    const commentInput = document.getElementById('comment-text');
    
    if (!nameInput.value || !commentInput.value) {
        alert('Please enter your name and comment');
        return;
    }
    
    await addComment(articleId, nameInput.value, commentInput.value);
    await loadComments(articleId);
    commentInput.value = '';
}

// Submit rating from article detail page
async function submitRating(articleId) {
    const ratingSelect = document.getElementById('rating-select');
    if (!ratingSelect) return;
    
    await addRating(articleId, parseInt(ratingSelect.value));
    await loadRatings(articleId);
}

// Load categories dropdown
async function loadCategoriesDropdown() {
    const categories = await getCategories();
    const select = document.getElementById('category-filter');
    if (!select) return;
    
    select.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });
}

// ============================================
// 8. AUTO-INITIALIZATION (Page load)
// ============================================

// Check which page is loaded and initialize accordingly
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    
    // Initialize categories dropdown on legalarticles.html
    if (page === 'legalarticles.html' || page === '') {
        loadCategoriesDropdown();
        displayArticles('all');
    }
    
    // Initialize article detail page
    if (page === 'article-detail.html') {
        loadArticleDetail();
    }
    
    // Load saved articles on saved-articles.html
    if (page === 'saved-articles.html') {
        displayArticles('saved');
    }
    
    // Load featured articles on index.html
    if (page === 'index.html' || page === '') {
        displayArticles('featured');
    }
});

// ============================================
// 9. EXPOSE FUNCTIONS TO GLOBAL SCOPE
// ============================================

// Make functions available in HTML onclick attributes
window.loginUser = loginUser;
window.signupUser = signupUser;
window.publishArticle = publishArticle;
window.viewArticle = viewArticle;
window.saveArticle = saveArticle;
window.toggleLikeAndUpdate = toggleLikeAndUpdate;
window.submitComment = submitComment;
window.submitRating = submitRating;
window.displayArticles = displayArticles;
window.loadCategoriesDropdown = loadCategoriesDropdown;
