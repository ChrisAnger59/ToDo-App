async function loadColumns() {
    try {
        const response = await fetchWithAuth(`${API_URL}/columns`);

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const columns = await response.json();
        console.log('✅ Colonnes reçues:', columns.length);

        // Vérifier que c'est bien un tableau
        if (!Array.isArray(columns)) {
            throw new Error('Format de réponse invalide');
        }

        // ✅ 1. D'ABORD afficher les colonnes (crée les zones de tâches)
        displayColumns(columns);
        populateColumnSelect(columns);

        // ✅ 2. PUIS charger les tâches (remplit les zones)
        await loadTodos();

    } catch (error) {
        console.error('❌ Erreur loadColumns:', error);
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
            showPopup('Colonne Ajoutée !', 'success');
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
            showPopup('Colonne Modifiée !', 'success');
        } else {
            const data = await response.json();
            showError(data.error || 'Erreur lors de la modification');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur de connexion au serveur');
    }
}

async function deleteColumn(columnId) {
    console.log('\n🗑️ Suppression colonne:', columnId);
    
    if (!confirm('Supprimer cette colonne et toutes ses tâches ?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/columns/${columnId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            console.log('✅ Colonne supprimée');
            
            // ✅ RECHARGER LES DEUX !
            await loadColumns();  // Recharge les colonnes
            await loadTodos();    // Recharge les tâches
            
        } else {
            const error = await response.json();
            console.error('❌ Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('❌ Erreur réseau:', error);
        alert('Erreur réseau');
    }
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