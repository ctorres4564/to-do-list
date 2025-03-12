const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

function renderTasks(tasks) {
    taskList.innerHTML = ''; // Limpa a lista antes de renderizar
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = task.text;
  
      if (task.completed) {
        li.classList.add('completed');
      }
  
      // Botão para excluir a tarefa
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Excluir';
      deleteBtn.classList.add('delete-btn');
      deleteBtn.addEventListener('click', () => deleteTask(index));
  
      li.appendChild(deleteBtn);
  
      // Marcar tarefa como concluída ao clicar nela
      li.addEventListener('click', () => toggleTaskCompletion(index));
  
      taskList.appendChild(li);
    });
  }

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskText = taskInput.value.trim();

  if (taskText !== '') {
    tasks.push({ text: taskText, completed: false });
    saveTasks();
    renderTasks(tasks);
    taskInput.value = '';
  }
});

function toggleTaskCompletion(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks(tasks);
  }

  function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    renderTasks(tasks);
  }
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  renderTasks(tasks);