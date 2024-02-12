const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("user-input");
const listContainer = document.getElementById("list-container");
const showCompleted = document.getElementById("show-completed");
const sortBy = document.getElementById("sort-by");
let tasks = [];
// Load data from local storage
showCompleted.checked = localStorage.getItem("showCompleted") === "true";
sortBy.value = localStorage.getItem("sortBy");
const storedTasks = localStorage.getItem("tasks");
if (storedTasks) {
  tasks = JSON.parse(storedTasks);
  renderList(tasks);
}

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(taskForm);
  if (!formData.get("user-input")) {
    showError();
    return;
  }
  tasks.push({
    timeStamp: new Date().toLocaleString("en-UK"),
    description: formData.get("user-input"),
    completed: false,
  });
  taskInput.value = "";
  renderList(tasks);
});

showCompleted.addEventListener("change", () => {
  renderList(tasks);
});
sortBy.addEventListener("change", () => {
  renderList(tasks);
});

function renderList(taskArr) {
  if (taskArr.length === 0) {
    localStorage.removeItem("tasks");
    localStorage.removeItem("showCompleted");
    localStorage.removeItem("sortBy");
  }
  // Check filter and sort
  buildList(filterAndSort(taskArr));
  saveStateToLocalStorage();
}

function saveStateToLocalStorage() {
  // Serialize tasks array to JSON before storing
  localStorage.setItem("tasks", JSON.stringify(tasks));

  // Store boolean value of showCompleted checkbox
  localStorage.setItem("showCompleted", showCompleted.checked);

  // Store the value of the sort by select element
  localStorage.setItem("sortBy", sortBy.value);
}

function showError() {
  const modal = document.createElement("dialog");

  const errorMsg = document.createElement("p");
  errorMsg.textContent = "You can't submit an empty task";
  const closeModal = document.createElement("button");
  closeModal.textContent = "Got it";

  modal.append(errorMsg, closeModal);
  document.body.append(modal);
  modal.showModal();
  window.addEventListener("click", () => {
    modal.close();
    window.removeEventListener("click", arguments.callee);
  });
}

function filterAndSort(arr) {
  return arr
    .filter((e) => (!showCompleted.checked ? !e.completed : e))
    .sort((a, b) => {
      if (sortBy.value === "time-asc")
        return new Date(a.timeStamp) - new Date(b.timeStamp);
      if (sortBy.value === "time-desc")
        return new Date(b.timeStamp) - new Date(a.timeStamp);
      if (sortBy.value === "alpha-asc")
        return b.description.localeCompare(a.description);
      if (sortBy.value === "alpha-desc")
        return a.description.localeCompare(b.description);
    });
}

function buildList(arr) {
  //Empty list
  while (listContainer.firstChild) {
    listContainer.firstChild.remove();
  }
  arr.forEach((task, i) => {
    const taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container");
    //
    const timeStampElem = document.createElement("p");
    timeStampElem.classList.add("timestamp");
    timeStampElem.textContent = task.timeStamp;
    //
    const descriptionElem = document.createElement("input");
    descriptionElem.value = task.description;
    descriptionElem.readOnly = true;
    descriptionElem.classList.add("description");
    //
    const completedElem = document.createElement("input");

    completedElem.type = "checkbox";
    completedElem.checked = task.completed;
    if (task.completed) {
      taskContainer.classList.add("completed");
    }
    completedElem.addEventListener("change", () => {
      tasks[i].completed = completedElem.checked;
      if (completedElem.checked) {
        taskContainer.classList.add("completed");
      } else {
        taskContainer.classList.remove("completed");
      }
      renderList(tasks);
    });
    //
    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      console.log("trying to edit eh?");
      tasks[i].description = descriptionElem.value;
      descriptionElem.readOnly = !descriptionElem.readOnly;
      editButton.textContent = descriptionElem.readOnly ? "Edit" : "Save";
      if (!descriptionElem.readOnly) descriptionElem.focus();
    });
    //
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      tasks.splice(i, 1);
      renderList(tasks);
    });

    taskContainer.append(
      timeStampElem,
      descriptionElem,
      completedElem,
      editButton,
      deleteButton
    );
    listContainer.prepend(taskContainer);
  });
}
