// ui.js - Manipulação da interface
import { taskManager } from './tasks.js';

// Cores em hexadecimal para categorias e prioridades
const COLORS = {
    trabalho: '#3B82F6',
    estudos: '#10B981',
    pessoal: '#8B5CF6',
    saude: '#EF4444',
    alta: '#EF4444',
    media: '#F59E0B',
    baixa: '#10B981',
    default: '#6B7280'
};

export const taskUI = {
    // Atualiza a lista de tarefas na tela
    renderTasks: () => {
        const tasks = taskManager.getTasks();
        const container = document.getElementById('tasks-container');

        if (!container) {
            console.error('Container de tarefas não encontrado!');
            return;
        }

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-water" style="font-size: 3rem; color: ${COLORS.default};"></i>
                    <h3>O mar está calmo!</h3>
                    <p>Adicione sua primeira tarefa para começar.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <div class="task-meta">
                        <span class="task-category" style="color: ${COLORS[task.category] || COLORS.default}">
                            <i class="${taskUI.getCategoryIcon(task.category)}"></i>
                            ${taskUI.formatCategoryName(task.category)}
                        </span>
                        <span class="task-priority" style="color: ${COLORS[task.priority] || COLORS.default}">
                            <i class="${taskUI.getPriorityIcon(task.priority)}"></i>
                            ${taskUI.formatPriorityName(task.priority)}
                        </span>
                        <span class="task-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${taskUI.formatDate(task.date)}
                        </span>
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
        // Listener para completar tarefa
        document.querySelectorAll('.btn-action.complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                const updatedTasks = taskManager.toggleTask(taskId);
                if (updatedTasks) {
                    taskUI.renderTasks();
                }
            });
        });

        // Listener para deletar tarefa
        document.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    const updatedTasks = taskManager.removeTask(taskId);
                    if (updatedTasks) {
                        taskUI.renderTasks();
                    }
                }
            });
        });
    },

    // Limpa o formulário
    clearForm: () => {
        const form = document.getElementById('task-form');
        if (form) {
            form.reset();
        }
    },

    // Mostra mensagens de erro
    showErrors: (errors) => {
        // Cria container de erro se não existir
        let errorContainer = document.getElementById('error-message');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = 'error-message';
            errorContainer.style.position = 'fixed';
            errorContainer.style.top = '20px';
            errorContainer.style.right = '20px';
            errorContainer.style.zIndex = '1000';
            document.body.appendChild(errorContainer);
        }

        errorContainer.innerHTML = errors.map(error => `
            <div class="error-message" style="
                background: #FEF2F2;
                color: #EF4444;
                padding: 12px;
                margin: 8px 0;
                border-radius: 8px;
                border-left: 4px solid #EF4444;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <i class="fas fa-exclamation-circle"></i>
                ${error}
            </div>
        `).join('');

        // Remove as mensagens após 5 segundos
        setTimeout(() => {
            if (errorContainer) {
                errorContainer.innerHTML = '';
            }
        }, 5000);
    },

    // Utilitários para ícones e formatação
    getCategoryIcon: (category) => {
        const icons = {
            'trabalho': 'fas fa-briefcase',
            'estudos': 'fas fa-graduation-cap',
            'pessoal': 'fas fa-home',
            'saude': 'fas fa-heart'
        };
        return icons[category] || 'fas fa-tag';
    },

    getPriorityIcon: (priority) => {
        const icons = {
            'alta': 'fas fa-exclamation-circle',
            'media': 'fas fa-exclamation-triangle',
            'baixa': 'fas fa-info-circle'
        };
        return icons[priority] || 'fas fa-circle';
    },

    formatCategoryName: (category) => {
        const names = {
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'pessoal': 'Pessoal',
            'saude': 'Saúde'
        };
        return names[category] || category;
    },

    formatPriorityName: (priority) => {
        const names = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };
        return names[priority] || priority;
    },

    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }
};