document.getElementById('taskForm').addEventListener('submit', function(event) {
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
    
    // Formatar a data no padrão dd/mm/aaaa (sem ajuste de fuso horário)
    const date = new Date(taskDate.value + 'T00:00:00'); // Força o uso da data local
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    
    // Criar o elemento da tarefa
    const li = document.createElement('li');
    li.style.fontFamily = fontSelect.value;
    li.setAttribute('data-date', taskDate.value); // Armazenar a data no formato YYYY-MM-DD para ordenação
    li.innerHTML = `
        <div>
            <input type="checkbox" class="complete-checkbox">
            <span>${taskInput.value} (${formattedDate})</span>
            <button class="edit" onclick="enableEditMode(this)">Editar</button>
            <button onclick="removeTask(this)">Excluir</button>
        </div>
        <div class="details">${taskDetails.value || 'Sem detalhes adicionais.'}</div>
    `;
    
    // Verificar urgência da tarefa
    checkTaskUrgency(li);
    
    // Adicionar a tarefa à lista
    taskList.appendChild(li);
    
    // Ordenar as tarefas por data
    sortTasksByDate();
    
    // Limpar os campos do formulário
    taskInput.value = '';
    taskDate.value = '';
    taskDetails.value = '';
});

function removeTask(button) {
    const li = button.parentElement.parentElement;
    li.remove();
}

function enableEditMode(button) {
    const li = button.parentElement.parentElement;
    const span = li.querySelector('span');
    const details = li.querySelector('.details');
    const checkbox = li.querySelector('.complete-checkbox'); // Capturar o checkbox

    // Salvar o conteúdo atual
    const taskText = span.textContent.split(' (')[0];
    const taskDate = span.textContent.split(' (')[1].replace(')', '');
    const taskDetails = details.textContent;

    // Entrar no modo de edição
    li.classList.add('edit-mode');
    li.innerHTML = `
        <div>
            ${checkbox.outerHTML} <!-- Manter o checkbox no lugar -->
            <input type="text" class="edit-task" value="${taskText}" placeholder="Tarefa">
            <input type="date" class="edit-date" value="${taskDate.split('/').reverse().join('-')}">
            <button class="save" onclick="saveEdit(this)">Salvar</button>
            <button class="cancel" onclick="cancelEdit(this)">Cancelar</button>
        </div>
        <textarea class="edit-details">${taskDetails}</textarea>
    `;
}

function saveEdit(button) {
    const li = button.parentElement.parentElement;
    const taskInput = li.querySelector('.edit-task');
    const taskDate = li.querySelector('.edit-date');
    const taskDetails = li.querySelector('.edit-details');
    const checkbox = li.querySelector('.complete-checkbox'); // Capturar o checkbox

    // Formatar a data no padrão dd/mm/aaaa (sem ajuste de fuso horário)
    const date = new Date(taskDate.value + 'T00:00:00'); // Força o uso da data local
    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

    // Atualizar a tarefa
    li.innerHTML = `
        <div>
            ${checkbox.outerHTML} <!-- Manter o checkbox no lugar -->
            <span>${taskInput.value} (${formattedDate})</span>
            <button class="edit" onclick="enableEditMode(this)">Editar</button>
            <button onclick="removeTask(this)">Excluir</button>
        </div>
        <div class="details">${taskDetails.value || 'Sem detalhes adicionais.'}</div>
    `;

    // Atualizar a data no atributo data-date
    li.setAttribute('data-date', taskDate.value);

    // Verificar urgência da tarefa
    checkTaskUrgency(li);

    // Reordenar as tarefas após a edição
    sortTasksByDate();
}

function cancelEdit(button) {
    const li = button.parentElement.parentElement;
    li.classList.remove('edit-mode');
}

// Marcar tarefa como concluída
document.getElementById('taskList').addEventListener('change', function(event) {
    if (event.target.classList.contains('complete-checkbox')) {
        const li = event.target.closest('li');
        if (event.target.checked) {
            li.classList.add('completed');
        } else {
            li.classList.remove('completed');
        }
    }
});

// Função para ordenar as tarefas por data
function sortTasksByDate() {
    const taskList = document.getElementById('taskList');
    const tasks = Array.from(taskList.children);

    tasks.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date'));
        const dateB = new Date(b.getAttribute('data-date'));
        return dateA - dateB; // Ordenar do mais antigo para o mais recente
    });

    // Limpar a lista e adicionar as tarefas ordenadas
    taskList.innerHTML = '';
    tasks.forEach(task => {
        taskList.appendChild(task);
        checkTaskUrgency(task); // Verificar urgência ao ordenar
    });
}

// Função para verificar a urgência da tarefa
function checkTaskUrgency(task) {
    const taskDate = new Date(task.getAttribute('data-date') + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Ignorar horas, minutos, segundos e milissegundos

    const timeDiff = taskDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    // Remover classes de urgência anteriores
    task.classList.remove('urgent', 'past-due');

    // Aplicar classes de urgência
    if (daysDiff < 1) {
        task.classList.add('past-due'); // Data passada
    } else if (daysDiff <= 7) {
        task.classList.add('urgent'); // Menos de 7 dias
    }
}