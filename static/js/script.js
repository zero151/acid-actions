// ========== КОНФИГУРАЦИЯ ==========
const API_BASE = "https://acid-actions.onrender.com"; 

// ========== Глобальное состояние ==========
let token = localStorage.getItem("access_token") || null;
let currentUser = null;
let isGuest = true;
let allActions = [];
let actionsLoaded = false;

// ========== Вспомогательные функции ==========
function showMessage(elementId, text, isError = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div class="result ${isError ? 'error' : 'success'}">${escapeHtml(text)}</div>`;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getAuthHeader() {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiRequest(url, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...getAuthHeader()
    };
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers
    });
    let data = {};
    try {
        data = await response.json();
    } catch (e) {}
    if (!response.ok) {
        const detail = data.detail || data.message || `HTTP ${response.status}`;
        throw new Error(detail);
    }
    return data;
}

// ========== Работа с localStorage (гость) ==========
function getGuestActions() {
    try {
        return JSON.parse(localStorage.getItem('guestActions')) || [];
    } catch {
        return [];
    }
}

function saveGuestActions(actions) {
    localStorage.setItem('guestActions', JSON.stringify(actions));
}

function addGuestAction(text) {
    const actions = getGuestActions();
    actions.push(text);
    saveGuestActions(actions);
    return actions;
}

function deleteGuestAction(index) {
    const actions = getGuestActions();
    if (index >= 0 && index < actions.length) {
        actions.splice(index, 1);
        saveGuestActions(actions);
    }
    return actions;
}

function deleteAllGuest() {
    saveGuestActions([]);
    return [];
}

// ========== Работа с бэкендом (авторизованный) ==========
async function fetchUserActions() {
    return await apiRequest('/actions', { method: 'GET' });
}

async function addUserAction(text) {
    await apiRequest('/action', {
        method: 'POST',
        body: JSON.stringify({ text })
    });
}

async function deleteUserAction(id) {
    await apiRequest(`/action/${id}`, { method: 'DELETE' });
}

async function deleteAllUserActions() {
    await apiRequest('/actions', { method: 'DELETE' });
}

// ========== Загрузка и отображение списка ==========
async function loadActions() {
    const container = document.getElementById('actionsList');
    try {
        if (isGuest) {
            allActions = getGuestActions();
            actionsLoaded = true;
            renderActions(allActions);
        } else {
            const actions = await fetchUserActions();
            allActions = actions;
            actionsLoaded = true;
            renderActions(allActions);
        }
    } catch (err) {
        container.innerHTML = `<div class="result error">${escapeHtml(err.message)}</div>`;
    }
}

// ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ РЕНДЕРИНГА ==========
function renderActions(actions) {
    const container = document.getElementById('actionsList');
    if (!actions || actions.length === 0) {
        container.innerHTML = `<div class="empty">Нет действий</div>`;
        return;
    }
    let html = '';
    if (isGuest) {
        actions.forEach((text, index) => {
            html += `
                <div class="action-item">
                    <div class="action-text"><b>${index + 1}.</b> ${escapeHtml(text)}</div>
                    <button class="btn-delete" onclick="deleteAction(${index})">Удалить</button>
                </div>
            `;
        });
    } else {
        // Для авторизованных используем индекс+1 для отображения, но для удаления - реальный id
        actions.forEach((action, index) => {
            html += `
                <div class="action-item">
                    <div class="action-text"><b>${index + 1}.</b> ${escapeHtml(action.text)}</div>
                    <button class="btn-delete" onclick="deleteAction(${action.id})">Удалить</button>
                </div>
            `;
        });
    }
    container.innerHTML = html;
}

// ========== Добавление действия ==========
async function addAction() {
    const input = document.getElementById('newAction');
    const text = input.value.trim();
    if (!text) {
        showMessage('addResult', 'Введите действие', true);
        return;
    }
    try {
        if (isGuest) {
            addGuestAction(text);
            allActions = getGuestActions();
            renderActions(allActions);
            showMessage('addResult', `Добавлено: ${escapeHtml(text)}`);
        } else {
            await addUserAction(text);
            await loadActions();
            showMessage('addResult', `Добавлено: ${escapeHtml(text)}`);
        }
        input.value = '';
    } catch (err) {
        showMessage('addResult', err.message, true);
    }
}

// ========== Удаление одного действия ==========
async function deleteAction(id) {
    if (!confirm(`Удалить действие №${id}?`)) return;
    try {
        if (isGuest) {
            deleteGuestAction(id);
            allActions = getGuestActions();
            renderActions(allActions);
        } else {
            await deleteUserAction(id);
            await loadActions();
        }
    } catch (err) {
        alert(err.message);
    }
}

// ========== Удаление всех действий ==========
async function deleteAll() {
    try {
        if (isGuest) {
            deleteAllGuest();
            allActions = [];
            renderActions([]);
        } else {
            await deleteAllUserActions();
            await loadActions();
        }
        closeDeleteAllModal();
    } catch (err) {
        alert(err.message);
    }
}

// ========== Получение случайных действий ==========
async function getRandomActions() {
    const countInput = document.getElementById('countInput');
    const uniqueCheck = document.getElementById('uniqueCheck');
    const count = parseInt(countInput.value) || 1;
    const unique = uniqueCheck.checked;

    try {
        if (!actionsLoaded) {
            await loadActions();
        }
        let actions = allActions;
        if (!actions || actions.length === 0) {
            showMessage('randomResult', 'Нет действий для выбора', true);
            return;
        }

        let texts = actions.map(a => isGuest ? a : a.text);
        let selected = [];

        if (unique) {
            if (count > texts.length) {
                showMessage('randomResult', `Недостаточно уникальных действий (доступно ${texts.length})`, true);
                return;
            }
            const shuffled = [...texts];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            selected = shuffled.slice(0, count);
        } else {
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * texts.length);
                selected.push(texts[idx]);
            }
        }

        const resultDiv = document.getElementById('randomResult');
        if (selected.length === 0) {
            resultDiv.innerHTML = '<div class="result">Нет результатов</div>';
        } else {
            const list = selected.map((v, i) => `${i + 1}. ${escapeHtml(v)}`).join('\n');
            resultDiv.innerHTML = `<div class="result success">${list.replace(/\n/g, '<br>')}</div>`;
        }
    } catch (err) {
        showMessage('randomResult', err.message, true);
    }
}

// ========== Аутентификация ==========
async function registerUser() {
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    if (!username || !password) {
        showMessage('registerResult', 'Заполните все поля', true);
        return;
    }
    try {
        await apiRequest('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        showMessage('registerResult', 'Регистрация успешна! Теперь войдите.');
        document.getElementById('regUsername').value = '';
        document.getElementById('regPassword').value = '';
        setTimeout(() => {
            closeRegisterModal();
            openLoginModal();
        }, 1500);
    } catch (err) {
        showMessage('registerResult', err.message, true);
    }
}

async function loginUser() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if (!username || !password) {
        showMessage('loginResult', 'Заполните все поля', true);
        return;
    }
    try {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Ошибка входа');
        }
        token = data.access_token;
        localStorage.setItem('access_token', token);
        await fetchCurrentUser();
        closeLoginModal();
        updateUI();
        await loadActions();
    } catch (err) {
        showMessage('loginResult', err.message, true);
    }
}

async function fetchCurrentUser() {
    try {
        const data = await apiRequest('/users/me', { method: 'GET' });
        currentUser = data;
        isGuest = false;
        return data;
    } catch (err) {
        token = null;
        localStorage.removeItem('access_token');
        currentUser = null;
        isGuest = true;
        throw err;
    }
}

function logoutUser() {
    token = null;
    localStorage.removeItem('access_token');
    currentUser = null;
    isGuest = true;
    allActions = [];
    actionsLoaded = false;
    updateUI();
    loadActions();
}

// ========== Обновление UI ==========
function updateUI() {
    const statusText = document.getElementById('statusText');
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const warningText = document.getElementById('warningText');

    if (isGuest) {
        statusText.textContent = 'Гость';
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
        warningText.textContent = 'Вы в режиме гостя. Действия сохраняются локально в браузере.';
    } else {
        statusText.textContent = `Пользователь: ${currentUser.username}`;
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = currentUser.username;
        warningText.textContent = 'Вы авторизованы. Все действия сохраняются на сервере.';
    }
}

// ========== Модальные окна ==========
function openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
    document.getElementById('registerResult').innerHTML = '';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginResult').innerHTML = '';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function openDeleteAllModal() {
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteAllModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Закрытие модалок по клику вне контента
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ========== Инициализация ==========
async function initApp() {
    if (token) {
        try {
            await fetchCurrentUser();
            updateUI();
            await loadActions();
            return;
        } catch (e) {
            token = null;
            localStorage.removeItem('access_token');
            currentUser = null;
            isGuest = true;
        }
    }
    // Гость
    updateUI();
    await loadActions();
}

document.addEventListener('DOMContentLoaded', initApp);