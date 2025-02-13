document.addEventListener('DOMContentLoaded', function () {
    carregarTarefas();
});

document.getElementById('taskForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const taskInput = document.getElementById('taskInput');
    const taskDate = document.getElementById('taskDate');
    const taskDetails = document.getElementById('taskDetails');
    const fontSelect = document.getElementById('fontSelect');
    const taskList = document.getElementById('taskList');

    if (taskInput.value.trim() === '') {
        alert('Por favor, insira uma tarefa.');
        return;
    }

    const date = new Date(taskDate.value + 'T00:00:00');
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    const task = {
        text: taskInput.value,
        date: taskDate.value,
        formattedDate: formattedDate,
        details: taskDetails.value || 'Sem detalhes adicionais.',
        font: fontSelect.value,
        completed: false
    };

    adicionarTarefaAoDOM(task);
    salvarTarefaNoLocalStorage(task);

    taskInput.value = '';
    taskDate.value = '';
    taskDetails.value = '';
});

function adicionarTarefaAoDOM(task) {
    const taskList = document.getElementById('taskList');

    const li = document.createElement('li');
    li.style.fontFamily = task.font;
    li.setAttribute('data-date', task.date);

    if (task.completed) {
        li.classList.add('completed');
    }

    li.innerHTML = `
        <div>
            <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.text} (${task.formattedDate})</span>
            <button class="edit" onclick="habilitarModoEdicao(this)">Editar</button>
            <button onclick="removerTarefa(this)">Excluir</button>
        </div>
        <div class="details">${task.details}</div>
    `;

    taskList.appendChild(li);

    verificarUrgenciaTarefa(li);

    ordenarTarefasPorData();
}

function salvarTarefaNoLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function carregarTarefas() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => adicionarTarefaAoDOM(task));
}

function removerTarefa(button) {
    const li = button.parentElement.parentElement;
    const taskText = li.querySelector('span').textContent.split(' (')[0];
    const taskDate = li.querySelector('span').textContent.split(' (')[1].replace(')', '');

    removerTarefaDoLocalStorage(taskText, taskDate);

    li.remove();
}

function removerTarefaDoLocalStorage(taskText, taskDate) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => !(task.text === taskText && task.formattedDate === taskDate));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function habilitarModoEdicao(button) {
    const li = button.parentElement.parentElement;
    const span = li.querySelector('span');
    const details = li.querySelector('.details');
    const checkbox = li.querySelector('.complete-checkbox');

    const taskText = span.textContent.split(' (')[0];
    const taskDate = span.textContent.split(' (')[1].replace(')', '');
    const taskDetails = details.textContent;

    li.classList.add('edit-mode');
    li.innerHTML = `
        <div>
            ${checkbox.outerHTML}
            <input type="text" class="edit-task" value="${taskText}" placeholder="Tarefa">
            <input type="date" class="edit-date" value="${taskDate.split('/').reverse().join('-')}">
            <button class="save" onclick="salvarEdicao(this)">Salvar</button>
            <button class="cancel" onclick="cancelarEdicao(this)">Cancelar</button>
        </div>
        <textarea class="edit-details">${taskDetails}</textarea>
    `;
}

function salvarEdicao(button) {
    const li = button.parentElement.parentElement;
    const taskInput = li.querySelector('.edit-task');
    const taskDate = li.querySelector('.edit-date');
    const taskDetails = li.querySelector('.edit-details');
    const checkbox = li.querySelector('.complete-checkbox');

    const date = new Date(taskDate.value + 'T00:00:00');
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    li.innerHTML = `
        <div>
            ${checkbox.outerHTML}
            <span>${taskInput.value} (${formattedDate})</span>
            <button class="edit" onclick="habilitarModoEdicao(this)">Editar</button>
            <button onclick="removerTarefa(this)">Excluir</button>
        </div>
        <div class="details">${taskDetails.value || 'Sem detalhes adicionais.'}</div>
    `;

    li.setAttribute('data-date', taskDate.value);

    atualizarTarefaNoLocalStorage(taskInput.value, formattedDate, taskDetails.value);

    verificarUrgenciaTarefa(li);

    ordenarTarefasPorData();
}

function atualizarTarefaNoLocalStorage(taskText, taskDate, taskDetails) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.text === taskText && task.formattedDate === taskDate) {
            task.date = taskDate;
            task.formattedDate = `${String(new Date(taskDate).getDate()).padStart(2, '0')}/${String(new Date(taskDate).getMonth() + 1).padStart(2, '0')}/${new Date(taskDate).getFullYear()}`;
            task.details = taskDetails;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function cancelarEdicao(button) {
    const li = button.parentElement.parentElement;
    li.classList.remove('edit-mode');
}

document.getElementById('taskList').addEventListener('change', function (event) {
    if (event.target.classList.contains('complete-checkbox')) {
        const li = event.target.closest('li');
        const taskText = li.querySelector('span').textContent.split(' (')[0];
        const taskDate = li.querySelector('span').textContent.split(' (')[1].replace(')', '');

        if (event.target.checked) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }

        atualizarConclusaoTarefaNoLocalStorage(taskText, taskDate, event.target.checked);

        verificarUrgenciaTarefa(li);
    }
});

function atualizarConclusaoTarefaNoLocalStorage(taskText, taskDate, completed) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.text === taskText && task.formattedDate === taskDate) {
            task.completed = completed;
        }
        return task;
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function ordenarTarefasPorData() {
    const taskList = document.getElementById('taskList');
    const tasks = Array.from(taskList.children);

    tasks.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateA - dateB;
    });

    taskList.innerHTML = '';
    tasks.forEach(task => {
        taskList.appendChild(task);
        verificarUrgenciaTarefa(task);
    });
}

function verificarUrgenciaTarefa(task) {
    const taskDate = new Date(task.getAttribute('data-date') + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const timeDiff = taskDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    task.classList.remove('urgent', 'past-due');

    if (daysDiff < 1) {
        task.classList.add('past-due');
    } else if (daysDiff <= 7) {
        task.classList.add('urgent');
    }
}
