const STORAGE_KEY = "todos";

const form = document.getElementById("new-todo-form");
const input = document.getElementById("new-todo-input");
const list = document.getElementById("todo-list");
const footer = document.getElementById("footer");
const count = document.getElementById("count");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll("[data-filter]");

let todos = load();
let filter = "all";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 保存できない環境（プライベートモード等）ではメモリ上でのみ動作する
  }
}

function update() {
  save();
  render();
}

function addTodo(title) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  todos.push({ id, title, completed: false });
  update();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  todo.completed = !todo.completed;
  update();
}

function renameTodo(id, title) {
  if (!title) {
    deleteTodo(id);
    return;
  }
  todos.find((t) => t.id === id).title = title;
  update();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  update();
}

function clearCompleted() {
  todos = todos.filter((t) => !t.completed);
  update();
}

function visibleTodos() {
  if (filter === "active") return todos.filter((t) => !t.completed);
  if (filter === "completed") return todos.filter((t) => t.completed);
  return todos;
}

function createItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", "完了");
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = todo.title;
  title.addEventListener("dblclick", () => startEditing(li, title, todo));

  const del = document.createElement("button");
  del.type = "button";
  del.className = "delete";
  del.textContent = "×";
  del.setAttribute("aria-label", "削除");
  del.addEventListener("click", () => deleteTodo(todo.id));

  li.append(checkbox, title, del);
  return li;
}

function startEditing(li, title, todo) {
  const edit = document.createElement("input");
  edit.className = "edit";
  edit.value = todo.title;

  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    if (commit) {
      renameTodo(todo.id, edit.value.trim());
    } else {
      render();
    }
  };

  edit.addEventListener("keydown", (e) => {
    if (e.isComposing) return;
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  edit.addEventListener("blur", () => finish(true));

  title.replaceWith(edit);
  edit.focus();
  edit.select();
}

function render() {
  list.replaceChildren(...visibleTodos().map(createItem));

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.length - activeCount;

  footer.hidden = todos.length === 0;
  count.textContent = `残り ${activeCount} 件`;
  clearCompletedButton.disabled = completedCount === 0;

  filterButtons.forEach((button) => {
    button.classList.toggle("selected", button.dataset.filter === filter);
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  addTodo(title);
  input.value = "";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    render();
  });
});

clearCompletedButton.addEventListener("click", clearCompleted);

render();
