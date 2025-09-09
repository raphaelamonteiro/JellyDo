import { taskManager } from './tasks.js';

export const taskUI = {
    // Atualiza a lista de tarefas na tela
    renderTasks: () => {
        const tasks = taskManager.getTasks();
        const container = document.getElementById('tasks-container');

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🐙</div>
                    <h3>O mar está calmo!</h3>
                    <p>Adicione sua primeira tarefa para começar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}">
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <div class="task-meta">
                        <span class="task-category">${taskUI.getCategoryIcon(task.category)} ${task.category}</span>
                        <span class="task-priority ${task.priority}">${taskUI.getPriorityIcon(task.priority)} ${task.priority}</span>
                        <span class="task-date">📅 ${taskUI.formatDate(task.date)}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-action complete" data-id="${task.id}">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="btn-action delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Adiciona event listeners aos botões
        taskUI.addTaskEventListeners();
    },

    // Adiciona listeners para os botões
    addTaskEventListeners: () => {
        document.querySelectorAll('.btn-action.complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.btn-action').dataset.id;
                taskManager.toggleTask(taskId);
                taskUI.renderTasks();
            });
        });

        document.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.btn-action').dataset.id;
                taskManager.removeTask(taskId);
                taskUI.renderTasks();
            });
        });
    },

    // Limpa o formulário
    clearForm: () => {
        document.getElementById('task-form').reset();
    },

    // Mostra mensagens de erro
    showErrors: (errors) => {
        const errorContainer = document.getElementById('error-message');
        errorContainer.innerHTML = errors.map(error =>
            `<div class="error">${error}</div>`
        ).join('');

        setTimeout(() => {
            errorContainer.innerHTML = '';
        }, 3000);
    },

    // Utilitários para ícones e formatação
    getCategoryIcon: (category) => {
        const icons = {
            'trabalho': '💼',
            'estudos': '📚',
            'pessoal': '🏠',
            'saude': '❤️'
        };
        return icons[category] || '📌';
    },

    getPriorityIcon: (priority) => {
        const icons = {
            'alta': '🔴',
            'media': '🟡',
            'baixa': '🟢'
        };
        return icons[priority] || '⚪';
    },

    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
};