/* ===============================
   To-Do List – Script Completo
   =============================== */

// ---- Seletores (com fallback para maior compatibilidade) ----
const form = document.querySelector('form');
const input = document.getElementById('new-todo') || form?.querySelector('input[type="text"]');
const listEl = document.getElementById('todo-list') || document.querySelector('ul');
const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
const clearBtn = document.getElementById('clear-completed');
const counterEl = document.getElementById('counter');

if (!form || !input || !listEl) {
  console.warn('HTML mínimo não encontrado. Garanta: <form><input type="text" id="new-todo"></form> e <ul id="todo-list"></ul>');
}

// ---- Persistência ----
const STORAGE_KEY = 'todo-items-v2';

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ---- Modelo ----
function createItem(text) {
  return {
    id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random()),
    text: text.trim(),
    completed: false,
    createdAt: Date.now(),
  };
}

// ---- Estado ----
let items = loadItems();
let activeFilter = 'all'; // 'all' | 'active' | 'completed'

// ---- Utilitários ----
function filteredItems() {
  switch (activeFilter) {
    case 'active':
      return items.filter(i => !i.completed);
    case 'completed':
      return items.filter(i => i.completed);
    default:
      return items;
  }
}

function updateCounter() {
  if (!counterEl) return;
  const remaining = items.filter(i => !i.completed).length;
  counterEl.textContent = `${remaining} restantes`;
}

// ---- Renderização ----
function render() {
  if (!listEl) return;
  listEl.innerHTML = '';

  for (const item of filteredItems()) {
    const li = document.createElement('li');
    li.dataset.id = item.id;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.completed;
    checkbox.setAttribute('aria-label', 'Marcar como concluída');
    checkbox.addEventListener('change', () => toggleComplete(item.id));

    // Texto
    const span = document.createElement('span');
    span.textContent = item.text;
    span.className = item.completed ? 'completed' : '';
    // Editar com duplo clique
    span.addEventListener('dblclick', () => beginEdit(item.id, span));

    // Ações (Editar/Excluir)
    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.gap = '8px';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'icon-btn';
    editBtn.title = 'Editar';
    editBtn.setAttribute('aria-label', 'Editar tarefa');
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', () => beginEdit(item.id, span));

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Excluir';
    delBtn.setAttribute('aria-label', 'Excluir tarefa');
    delBtn.addEventListener('click', () => removeItem(item.id));

    actions.append(editBtn, delBtn);

    li.append(checkbox, span, actions);
    listEl.append(li);
  }

  updateCounter();
}

// ---- Ações ----
function addItem(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return;
  items.unshift(createItem(trimmed));
  saveItems(items);
  render();
}

function toggleComplete(id) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.completed = !it.completed;
  saveItems(items);
  render();
}

function removeItem(id) {
  items = items.filter(i => i.id !== id);
  saveItems(items);
  render();
}

function beginEdit(id, spanEl) {
  const it = items.find(i => i.id === id);
  if (!it || !spanEl) return;

  const inputEdit = document.createElement('input');
  inputEdit.type = 'text';
  inputEdit.value = it.text;
  inputEdit.className = 'todo-edit';

  // Troca visual
  spanEl.replaceWith(inputEdit);
  inputEdit.focus();
  inputEdit.setSelectionRange(0, inputEdit.value.length);

  const commit = () => {
    const newText = inputEdit.value.trim();
    if (newText) it.text = newText;
    saveItems(items);
    render();
  };

  inputEdit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') render();
  });
  inputEdit.addEventListener('blur', commit, { once: true });
}

function clearCompleted() {
  const before = items.length;
  items = items.filter(i => !i.completed);
  if (items.length !== before) {
    saveItems(items);
    render();
  }
}

// ---- Eventos ----
if (form && input) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addItem(input.value);
    form.reset();
    input.focus();
  });
}

// Filtros (Todos / Ativos / Concluídos)
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    activeFilter = btn.dataset.filter || 'all';
    // estado visual
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

// Limpar concluídas
if (clearBtn) {
  clearBtn.addEventListener('click', clearCompleted);
}

// ---- Render inicial ----
render();

/* Dica: se quiser permitir marcar concluída clicando no texto, ative abaixo.
listEl?.addEventListener('click', (e) => {
  const span = e.target.closest('li span');
  if (!span) return;
  const id = span.closest('li')?.dataset.id;
  if (!id) return;
  toggleComplete(id);
});
*/
