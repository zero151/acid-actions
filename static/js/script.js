// API будет работать как на локальном сервере, так и после деплоя
const API = "";

/*
Если фронтенд открыт отдельно от FastAPI (например, через Live Server),
раскомментируй строку ниже и настрой CORS на бэкенде:
const API = "http://localhost:8000";
CORS middleware:
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
*/

function showMessage(elementId, text, isError = false) {
    document.getElementById(elementId).innerHTML =
        `<div class="result ${isError ? 'error' : 'success'}">${text}</div>`;
}

async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        let data = {};
        try {
            data = await response.json();
        } catch {}

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        return data;
    } catch (err) {
        throw new Error(err.message || "Ошибка сети");
    }
}

async function loadActions() {
    const container = document.getElementById("actionsList");
    try {
        const data = await request(`${API}/all`);
        if (data.message === "no action") {
            container.innerHTML = `<div class="empty">Нет действий</div>`;
            return;
        }
        const actions = data.actions || {};
        let html = "";
        for (const [index, text] of Object.entries(actions)) {
            html += `
                <div class="action-item">
                    <div class="action-text">
                        <b>${index}.</b> ${escapeHtml(text)}
                    </div>
                    <button class="btn-delete" onclick="deleteAction(${index})">Удалить</button>
                </div>
            `;
        }
        container.innerHTML = html || `<div class="empty">Нет действий</div>`;
    } catch (err) {
        container.innerHTML = `<div class="result error">${err.message}</div>`;
    }
}

async function addAction() {
    const input = document.getElementById("newAction");
    const text = input.value.trim();
    if (!text) {
        showMessage("addResult", "Введите действие", true);
        return;
    }
    try {
        const data = await request(`${API}/add/${encodeURIComponent(text)}`, { method: "POST" });
        showMessage("addResult", `Добавлено: ${data.added ?? text}`);
        input.value = "";
        loadActions();
    } catch (err) {
        showMessage("addResult", err.message, true);
    }
}

async function getRandomActions() {
    const count = document.getElementById("countInput").value || 1;
    const unique = document.getElementById("uniqueCheck").checked;
    try {
        const data = await request(`${API}/random?count=${count}&unique=${unique}`);
        if (data.error) {
            showMessage("randomResult", data.error, true);
            return;
        }
        if (typeof data.message === "string") {
            showMessage("randomResult", data.message);
            return;
        }
        if (Array.isArray(data.message)) {
            const list = data.message.map((v, i) => `${i + 1}. ${v}`).join("\n");
            showMessage("randomResult", list);
        }
    } catch (err) {
        showMessage("randomResult", err.message, true);
    }
}

async function deleteAction(index) {
    if (!confirm(`Удалить действие №${index}?`)) return;
    try {
        await request(`${API}/del/${index}`, { method: "DELETE" });
        loadActions();
    } catch (err) {
        alert(err.message);
    }
}

function openDeleteAllModal() {
    document.getElementById("deleteModal").style.display = "flex";
}

function closeDeleteAllModal() {
    document.getElementById("deleteModal").style.display = "none";
}

async function deleteAll() {
    try {
        await request(`${API}/del/all`, { method: "DELETE" });
        closeDeleteAllModal();
        loadActions();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHtml(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}

// Загружаем список при открытии страницы
loadActions();