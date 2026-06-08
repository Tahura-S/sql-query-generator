// ===== ELEMENTS =====
const themeSwitcher = document.getElementById("themeSwitcher");
const schemaInput = document.getElementById("schema-input");
const userInput = document.getElementById("question-input");
const generateBtn = document.getElementById("generateBtn");
const sqlOutput = document.getElementById("generatedQueryBox");
const copyBtn = document.getElementById("copy-btn");
const loadingSpinner = document.getElementById("loadingSpinner");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ===== THEME SWITCHER =====
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
    themeSwitcher.checked = true;
}

themeSwitcher.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme",
        document.body.classList.contains("dark-mode") ? "dark" : "light"
    );
});

// ===== QUERY HISTORY =====
class QueryHistory {
    constructor() {
        this.storageKey = "sqlQueryHistory";
        this.maxItems = 20;
        this.loadFromStorage();
    }

    loadFromStorage() {
        const data = localStorage.getItem(this.storageKey);
        this.queries = data ? JSON.parse(data) : [];
    }

    add(sql) {
        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.queries.unshift({ sql, timestamp });
        if (this.queries.length > this.maxItems) {
            this.queries.pop();
        }
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queries));
    }

    clear() {
        this.queries = [];
        this.save();
        this.render();
    }

    render() {
        if (this.queries.length === 0) {
            historyList.innerHTML = '<p class="empty-message">No queries yet</p>';
            return;
        }

        historyList.innerHTML = this.queries.map((item, idx) => `
            <div class="history-item" onclick="queryHistory.loadQuery(${idx})">
                <div>${item.sql.substring(0, 50)}${item.sql.length > 50 ? '...' : ''}</div>
                <div class="history-item-timestamp">${item.timestamp}</div>
            </div>
        `).join('');
    }

    loadQuery(idx) {
        const sql = this.queries[idx].sql;
        sqlOutput.innerHTML = '';
        const codeEl = document.createElement('code');
        codeEl.textContent = sql;
        sqlOutput.appendChild(codeEl);
        highlightCode();
    }
}

const queryHistory = new QueryHistory();
queryHistory.render();

clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all query history?")) {
        queryHistory.clear();
    }
});

// ===== SYNTAX HIGHLIGHTING =====
const highlightCode = () => {
    const code = sqlOutput.querySelector('code');
    if (code) {
        hljs.highlightElement(code);
    }
};

// ===== LOADING SPINNER =====
const showLoadingSpinner = () => {
    loadingSpinner.classList.add("active");
};

const hideLoadingSpinner = () => {
    loadingSpinner.classList.remove("active");
};

// ===== COPY BUTTON =====
copyBtn.addEventListener("click", () => {
    const text = sqlOutput.innerText.trim();
    if (!text) return;

    navigator.clipboard.writeText(text);
    const originalText = copyBtn.textContent;
    copyBtn.textContent = "✔ Copied!";
    setTimeout(() => (copyBtn.textContent = originalText), 1200);
});

// ===== QUICK EXAMPLES =====
document.querySelectorAll(".example-card").forEach(card => {
    card.addEventListener("click", () => {
        schemaInput.value = card.dataset.schema;
        userInput.value = card.dataset.question;
        clearFieldErrors();
    });
});

// ===== ERROR HANDLING =====
const clearFieldErrors = () => {
    schemaInput.classList.remove("error-field");
    userInput.classList.remove("error-field");
};

const showFieldError = (field, message) => {
    clearFieldErrors();

    if (field === "schema") {
        schemaInput.classList.add("error-field");
    } else if (field === "question") {
        userInput.classList.add("error-field");
    }

    sqlOutput.innerHTML = '';
    const p = document.createElement('p');
    p.textContent = `⚠️ ${message}`;
    p.style.color = '#dc3545';
    sqlOutput.appendChild(p);
};

// ===== GENERATE SQL =====
generateBtn.addEventListener("click", async () => {
    const schema = schemaInput.value.trim();
    const question = userInput.value.trim();

    clearFieldErrors();
    showLoadingSpinner();

    try {
        const response = await fetch("/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schema, question })
        });

        const data = await response.json();
        hideLoadingSpinner();

        if (data.error) {
            showFieldError(data.field, data.message);
            return;
        }

        // Display SQL with syntax highlighting
        sqlOutput.innerHTML = '';
        const codeEl = document.createElement('code');
        codeEl.textContent = data.sql || "No SQL generated.";
        codeEl.className = 'language-sql';
        sqlOutput.appendChild(codeEl);

        highlightCode();
        queryHistory.add(data.sql);
        clearFieldErrors();

    } catch (err) {
        hideLoadingSpinner();
        sqlOutput.innerHTML = '';
        const p = document.createElement('p');
        p.textContent = "❌ Error generating SQL. Check console.";
        p.style.color = '#dc3545';
        sqlOutput.appendChild(p);
        console.error(err);
    }
});
