async function signup(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    if (confirmPassword && password !== confirmPassword) {
        showError('Les mots de passe ne correspondent pas');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Inscription réussie ! Redirection...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            if (data.errors) {
                const errorMessages = Object.values(data.errors)
                    .map(err => err.message)
                    .join(', ');
                showError(errorMessages);
            } else {
                showError(data.error || 'Erreur lors de l\'inscription');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function login(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Sauvegarder le token
            saveToken(data.token);
            
            showSuccess('Connexion réussie ! Redirection...');
            setTimeout(() => {
                window.location.href = 'todos.html';
            }, 1000);
        } else {
            showError(data.error || 'Email ou mot de passe incorrect');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

function logout() {
    removeToken();
    window.location.href = 'index.html';
}
