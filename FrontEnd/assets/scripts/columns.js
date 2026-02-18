// Vérifier l'authentification au chargement
requireAuth();

async function loadColumns() {
    try {
        const response = await fetchWithAuth(`${API_URL}/columns`);

        // Vérifier le statut de la réponse
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        // Le backend retourne directement un tableau
        const columns = await response.json();

        console.log('Columns reçues:', columns); // DEBUG

        // Vérifier que c'est bien un tableau
        if (!Array.isArray(columns)) {
            throw new Error('Format de réponse invalide');
        }

        displayColumns(columns);
        populateColumnSelect(columns);

    } catch (error) {
        console.error('Erreur détaillée:', error);
        showError('Impossible de charger les colonnes: ' + error.message);
        displayColumns([]);
    }
}

function displayColumns(columns) {
    const columnList = document.getElementById('column-list');

    if (!columns || !Array.isArray(columns)) {
        console.warn('columns n\'est pas un tableau:', columns);
        columns = [];
    }

    if (columns.length === 0) {
        columnList.innerHTML = '<p class="empty-message">Aucune colonne. Créez-en une pour commencer !</p>';
        return;
    }

    // ✅ Afficher les colonnes avec leurs en-têtes et zones de tâches
    columnList.innerHTML = columns.map(column => `
        <section class="column" id="column${column._id}" data-title="${escapeHtml(column.title)}">
            <!-- En-tête de la colonne -->
            <header class="column-header">
                <h2 class="column-title">${escapeHtml(column.title)}</h2>
                <div class="column-actions">
                    <button class="edit-btn" onclick="editColumn('${column._id}')" title="Modifier">✏️</button>
                    <button class="delete-btn" onclick="deleteColumn('${column._id}')" title="Supprimer">🗑️</button>
                </div>
            </header>

            <!-- Zone des tâches (sera remplie par displayTodos) -->
            <div class="task-list" data-column-id="${column._id}">
                <p class="empty-message">Aucune tâche dans cette colonne</p>
            </div>
        </section>
    `).join('');
}

async function createColumn(event) {
    event.preventDefault();

    const titleInput = document.getElementById('column-title');
    const title = titleInput.value.trim();

    if (!title) {
        showError('Le titre ne peut pas être vide');
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/columns`, {
            method: 'POST',
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            titleInput.value = ''; // Vider le champ
            loadColumns();
            showSuccess('Colonne ajoutée !');
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de l\'ajout');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function updateColumn(id, title) {  // Renommer la fonction
    try {
        const response = await fetchWithAuth(`${API_URL}/columns/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title })
        });

        if (response.ok) {
            loadColumns();  // ← Recharger les COLONNES
            showSuccess('Colonne modifiée !');
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de la modification');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function deleteColumn(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette colonne ?')) {
        return;
    }

    try {
        const response = await fetchWithAuth(`${API_URL}/columns/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadColumns();
            showSuccess('Colonne supprimée !');
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

function editColumn(id) {
    const section = document.getElementById(`column${id}`);
    const currentTitle = section.dataset.title; // Récupérer depuis data-title

    const newTitle = prompt('Nouveau titre:', currentTitle);

    if (newTitle && newTitle.trim() !== '') {
        updateColumn(id, newTitle.trim());
    }
}

// Remplir le <select> du formulaire de tâches
function populateColumnSelect(columns) {
    const select = document.getElementById('todo-column');

    if (!select) return; // Si on n'est pas sur la page todos

    select.innerHTML = '<option value="">-- Choisir une colonne --</option>' +
        columns.map(col => 
            `<option value="${col._id}">${escapeHtml(col.title)}</option>`
        ).join('');
}