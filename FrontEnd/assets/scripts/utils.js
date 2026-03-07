// ========== CONFIGURATION ==========
// const API_URL = 'http://localhost:3000/api';
const API_URL = 'https://todo-app-v8gk.onrender.com/api'

// ========== GESTION TOKEN ==========
function saveToken(token) {
    localStorage.setItem('token', token);
}

function getToken() {
    return localStorage.getItem('token');
}

function removeToken() {
    localStorage.removeItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

// ========== PROTECTION DES PAGES ==========
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// ========== FETCH AVEC TOKEN ==========
async function fetchWithAuth(url, options = {}) {
    const token = getToken();

    if (!token) {
        window.location.href = 'index.html';
        throw new Error('Non authentifié');
    }

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    // Fusionner les options
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, finalOptions);

        // Si 401 (token invalide), déconnecter
        if (response.status === 401) {
            removeToken();
            window.location.href = 'index.html';
            throw new Error('Session expirée');
        }

        return response;
    } catch (error) {
        console.error('Erreur fetch:', error);
        throw error;
    }
}

// ========== MESSAGES ==========
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    if (successDiv) successDiv.style.display = 'none';

    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Auto-masquer après 5 secondes
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showPopup(message, type = 'success') {
    const container = document.getElementById('popup-container');

    const popup = document.createElement('div');
    popup.className = `popup ${type}`;
    popup.textContent = message;

    container.appendChild(popup);

    // Retire le pop-up après l’animation
    setTimeout(() => {
        popup.remove();
    }, 3000);
}



// ========== ÉCHAPPEMENT HTML ==========
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
