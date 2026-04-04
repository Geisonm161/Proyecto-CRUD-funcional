const STORAGE_KEY = "crud_tasks_v1";

const taskForm = document.getElementById("taskForm");
const taskIdInput = document.getElementById("taskId");
const titleInput = document.getElementById("taskTitle");
const descriptionInput = document.getElementById("taskDescription");
const cancelBtn = document.getElementById("cancelBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const exportBtn = document.getElementById("exportBtn");

let tasks = loadTasks();

function loadTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function showValidationError(message) {
  window.alert(message);
}

function validateTaskData(title, description, editingId = "") {
  if (title.length < 3) {
    return "El titulo debe tener al menos 3 caracteres.";
  }

  if (description.length < 10) {
    return "La descripcion debe tener al menos 10 caracteres.";
  }

  const normalizedTitle = title.toLowerCase();
  const exists = tasks.some((task) => {
    return task.id !== editingId && task.title.toLowerCase() === normalizedTitle;
  });

  if (exists) {
    return "Ya existe una tarea con ese titulo.";
  }

  return "";
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
        <li class="task-item ${task.completed ? "is-completed" : ""}">
          <div class="row">
            <h3>${escapeHtml(task.title)}</h3>
            <small>${new Date(task.updatedAt).toLocaleString("es-CO")}</small>
          </div>
          <p>${escapeHtml(task.description)}</p>
          <small>Estado: ${task.completed ? "Completada" : "Pendiente"}</small>
          <div class="task-buttons">
            <button type="button" data-action="toggle" data-id="${task.id}">${task.completed ? "Reabrir" : "Completar"}</button>
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
    completed: false,
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

function toggleTaskStatus(id) {
  tasks = tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    return {
      ...task,
      completed: !task.completed,
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

function exportTasksToJson() {
  const data = JSON.stringify(tasks, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "tareas-crud.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();
  const validationError = validateTaskData(title, description, taskIdInput.value);

  if (!title || !description) {
    showValidationError("Todos los campos son obligatorios.");
    return;
  }

  if (validationError) {
    showValidationError(validationError);
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

exportBtn.addEventListener("click", () => {
  exportTasksToJson();
});

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

  if (action === "toggle") {
    toggleTaskStatus(id);
    return;
  }

  if (action === "delete") {
    deleteTask(id);
  }
});

renderTaskList();
