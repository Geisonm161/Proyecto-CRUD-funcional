const STORAGE_KEY = "crud_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const titleInput = document.getElementById("taskTitle");
const descriptionInput = document.getElementById("taskDescription");
const cancelBtn = document.getElementById("cancelBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");

let tasks = loadTasks();

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function resetForm() {
  taskIdInput.value = "";
  taskForm.reset();
}

function renderTaskList() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });

  if (!filtered.length) {
    taskList.innerHTML = '<li class="empty">No hay tareas para mostrar.</li>';
    return;
  }

  taskList.innerHTML = filtered
    .map((task) => {
      return `
        <li class="task-item">
          <div class="row">
            <h3>${escapeHtml(task.title)}</h3>
            <small>${new Date(task.updatedAt).toLocaleString("es-CO")}</small>
          </div>
          <p>${escapeHtml(task.description)}</p>
          <div class="task-buttons">
            <button type="button" data-action="edit" data-id="${task.id}">Editar</button>
            <button type="button" class="danger" data-action="delete" data-id="${task.id}">Eliminar</button>
          </div>
        </li>
      `;
    })
    .join("");
}

function createTask(title, description) {
  const now = new Date().toISOString();
  const newTask = {
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: now,
    updatedAt: now,
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTaskList();
}

function updateTask(id, title, description) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    return {
      ...task,
      title,
      description,
      updatedAt: new Date().toISOString(),
    };
  });

  saveTasks();
  renderTaskList();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTaskList();
}

function editTask(id) {
  const task = tasks.find((item) => item.id === id);
  if (!task) {
    return;
  }

  taskIdInput.value = task.id;
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  titleInput.focus();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title || !description) {
    return;
  }

  if (taskIdInput.value) {
    updateTask(taskIdInput.value, title, description);
  } else {
    createTask(title, description);
  }

  resetForm();
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

searchInput.addEventListener("input", renderTaskList);

taskList.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  const id = target.dataset.id;
  const action = target.dataset.action;
  if (!id || !action) {
    return;
  }

  if (action === "edit") {
    editTask(id);
    return;
  }

  if (action === "delete") {
    deleteTask(id);
  }
});

renderTaskList();
