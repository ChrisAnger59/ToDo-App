// Vérifier l'authentification au chargement
requireAuth();

async function loadTodos() {
    try {
        const response = await fetchWithAuth(`${API_URL}/todos`);

        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Le backend retourne directement un tableau
        const todos = await response.json();

        console.log('Todos reçues:', todos); // DEBUG

        // Vérifier que c'est bien un tableau
        if (!Array.isArray(todos)) {
            throw new Error('Format de réponse invalide');
        }

        displayTodos(todos); // Passer directement le tableau

    } catch (error) {
        console.error('Erreur détaillée:', error);
        showError('Impossible de charger les tâches: ' + error.message);
        displayTodos([]); // Afficher une liste vide
    }
}

function displayTodos(todos) {
    if (!todos || !Array.isArray(todos)) {
        console.warn('todos n\'est pas un tableau:', todos);
        todos = [];
    }

    // Récupérer toutes les zones de tâches
    const taskLists = document.querySelectorAll('.task-list');

    taskLists.forEach(taskList => {
        const columnId = taskList.dataset.columnId;

        // Filtrer les tâches de cette colonne
        const columnTodos = todos.filter(todo => todo.columnId === columnId);

        if (columnTodos.length === 0) {
            taskList.innerHTML = '<p class="empty-message">Aucune tâche dans cette colonne</p>';
            return;
        }

        // Afficher les tâches
        taskList.innerHTML = columnTodos.map(todo => `
            <article class="todo-item ${todo.completed ? 'completed' : ''}">
                <input 
                    type="checkbox" 
                    ${todo.completed ? 'checked' : ''} 
                    onchange="toggleTodo('${todo._id}', ${!todo.completed})"
                    class="todo-checkbox"
                >
                <span class="todo-title">${escapeHtml(todo.title)}</span>
                <button class="delete-btn" onclick="deleteTodo('${todo._id}')" title="Supprimer">🗑️</button>
            </article>
        `).join('');
    });
}

async function createTodo(event) {
    event.preventDefault();

    const titleInput = document.getElementById('todo-title');
    const columnSelect = document.getElementById('todo-column'); 

    const title = titleInput.value.trim();
    const columnId = columnSelect.value; 

    if (!title) {
        showError('Le titre ne peut pas être vide');
        return;
    }

    if (!columnId) { 
        showError('Veuillez sélectionner une colonne');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/todos`, {
            method: 'POST',
            body: JSON.stringify({ 
                title,
                columnId 
            })
        });

        if (response.ok) {
            titleInput.value = '';
            columnSelect.value = '';
            loadTodos();
            showSuccess('Tâche ajoutée !');
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de l\'ajout');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function toggleTodo(id, completed) {
    try {
        const response = await fetchWithAuth(`${API_URL}/todos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed })
        });

        if (response.ok) {
            loadTodos();
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de la modification');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function deleteTodo(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadTodos();
            showSuccess('Tâche supprimée !');
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Charger les colonnes D'ABORD, puis les tâches
document.addEventListener('DOMContentLoaded', async () => {
    await loadColumns(); // Attendre que les colonnes soient chargées
    loadTodos();         // Ensuite charger les tâches
});