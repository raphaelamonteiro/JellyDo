// ui.js - Manipulação da interface (refatorado)
import { taskManager } from './tasks.js';

// Remova a constante COLORS e use as variáveis CSS diretamente
export const taskUI = {
    currentFilters: {
        category: 'all',
        priority: 'all',
        status: 'all',
        sortBy: 'date'
    },

    // === INICIALIZAÇÃO ===
    init: function () {
        this.initFilters();
        this.renderTasks();
        this.setupEventListeners();
    },

    // === RENDERIZAÇÃO PRINCIPAL ===
    renderTasks: function () {
        const container = document.getElementById('tasks-container');
        if (!container) {
            console.error('Container de tarefas não encontrado!');
            return;
        }

        const tasks = this.getFilteredTasks();

        if (tasks.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
        this.addTaskEventListeners();
        this.updateTaskCounters();
    },

    // === FILTRAGEM E ORDENAÇÃO ===
    getFilteredTasks: function () {
        let tasks = taskManager.getTasks();

        // Aplicar filtros
        if (this.currentFilters.category !== 'all') {
            tasks = tasks.filter(task => task.category === this.currentFilters.category);
        }

        if (this.currentFilters.priority !== 'all') {
            tasks = tasks.filter(task => task.priority === this.currentFilters.priority);
        }

        if (this.currentFilters.status !== 'all') {
            const completed = this.currentFilters.status === 'completed';
            tasks = tasks.filter(task => task.completed === completed);
        }

        // Aplicar ordenação
        return this.sortTasks(tasks);
    },

    sortTasks: function (tasks) {
        switch (this.currentFilters.sortBy) {
            case 'date':
                return [...tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'priority':
                const priorityOrder = { alta: 0, media: 1, baixa: 2 };
                return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'name':
                return [...tasks].sort((a, b) => a.name.localeCompare(b.name));
            default:
                return tasks;
        }
    },

    // === COMPONENTES DE UI ===
    createTaskCard: function (task) {
        // Obter cores das variáveis CSS
        const categoryColor = this.getCategoryColor(task.category);
        const priorityColor = this.getPriorityColor(task.priority);

        return `
            <div class="task-card ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-info">
                    <h3>${this.escapeHtml(task.name)}</h3>
                    <div class="task-meta">
                        <span class="task-category" style="color: ${categoryColor}">
                            <i class="${this.getCategoryIcon(task.category)}"></i>
                            ${this.formatCategoryName(task.category)}
                        </span>
                        <span class="task-priority" style="color: ${priorityColor}">
                            <i class="${this.getPriorityIcon(task.priority)}"></i>
                            ${this.formatPriorityName(task.priority)}
                        </span>
                        <span class="task-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${this.formatDate(task.date)}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-action complete" data-id="${task.id}" title="${task.completed ? 'Desfazer' : 'Concluir'}">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="btn-action delete" data-id="${task.id}" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },

    renderEmptyState: function (container) {
        const hasFilters = Object.values(this.currentFilters).some(filter => filter !== 'all');
        const defaultColor = this.getCssVariableValue('--claro-texto');

        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-${hasFilters ? 'search' : 'water'}" style="font-size: 3rem; color: ${defaultColor};"></i>
                <h3>${hasFilters ? 'Nenhuma tarefa encontrada' : 'O mar está calmo!'}</h3>
                <p>${hasFilters ? 'Tente ajustar os filtros' : 'Adicione sua primeira tarefa para começar.'}</p>
                ${hasFilters ? '<button class="btn-clear-filters" onclick="taskUI.clearFilters()">Limpar Filtros</button>' : ''}
            </div>
        `;
    },

    // === EVENT LISTENERS ===
    setupEventListeners: function () {
        this.initFilters();

        // Listener para o formulário (se existir)
        const form = document.getElementById('task-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    },

    initFilters: function () {
        const filters = ['category', 'priority', 'status', 'sort'];

        filters.forEach(filterType => {
            const element = document.getElementById(`filter-${filterType}`);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.currentFilters[filterType === 'sort' ? 'sortBy' : filterType] = e.target.value;
                    this.renderTasks();
                });
            }
        });

        const clearButton = document.getElementById('clear-filters');
        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearFilters());
        }
    },

    addTaskEventListeners: function () {
        document.querySelectorAll('.btn-action.complete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.toggleTask(taskId);
            });
        });

        document.querySelectorAll('.btn-action.delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.currentTarget.dataset.id;
                this.deleteTask(taskId);
            });
        });
    },

    // === HANDLERS DE AÇÕES ===
    toggleTask: function (taskId) {
        const result = taskManager.toggleTask(taskId);
        if (result.success) {
            this.renderTasks();
            this.showSuccess('Tarefa atualizada com sucesso!');
        } else {
            this.showErrors(result.errors);
        }
    },

    deleteTask: function (taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            const result = taskManager.removeTask(taskId);
            if (result.success) {
                this.renderTasks();
                this.showSuccess('Tarefa excluída com sucesso!');
            } else {
                this.showErrors(result.errors);
            }
        }
    },

    handleFormSubmit: function (e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const taskData = {
            name: formData.get('name'),
            category: formData.get('category'),
            priority: formData.get('priority'),
            date: formData.get('date')
        };

        const result = taskManager.addTask(taskData);

        if (result.success) {
            this.clearForm();
            this.renderTasks();
            this.showSuccess('Tarefa adicionada com sucesso!');
        } else {
            this.showErrors(result.errors);
        }
    },

    // === UTILITÁRIOS ===
    clearFilters: function () {
        this.currentFilters = {
            category: 'all',
            priority: 'all',
            status: 'all',
            sortBy: 'date'
        };

        // Resetar elementos de filtro
        ['category', 'priority', 'status', 'sort'].forEach(filterType => {
            const element = document.getElementById(`filter-${filterType}`);
            if (element) element.value = filterType === 'sort' ? 'date' : 'all';
        });

        this.renderTasks();
    },

    updateTaskCounters: function () {
        const tasks = taskManager.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;

        let countersElement = document.getElementById('tasks-counters');
        if (!countersElement) {
            countersElement = document.createElement('div');
            countersElement.id = 'tasks-counters';
            countersElement.className = 'tasks-counters';
            document.querySelector('.tasks-section')?.prepend(countersElement);
        }

        countersElement.innerHTML = `
            <span class="counter total">Total: ${total}</span>
            <span class="counter completed">Concluídas: ${completed}</span>
            <span class="counter pending">Pendentes: ${pending}</span>
        `;
    },

    clearForm: function () {
        const form = document.getElementById('task-form');
        if (form) form.reset();
    },

    showErrors: function (errors) {
        this.showNotification(errors, 'error');
    },

    showSuccess: function (message) {
        this.showNotification([message], 'success');
    },

    showNotification: function (messages, type) {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }

        // Usar variáveis CSS para cores
        const bgColor = type === 'error'
            ? this.getCssVariableValue('--claro-container')
            : this.getCssVariableValue('--claro-container');
        const borderColor = type === 'error'
            ? this.getCssVariableValue('--claro-destaque')
            : this.getCssVariableValue('--claro-destaque');
        const textColor = type === 'error'
            ? this.getCssVariableValue('--claro-texto')
            : this.getCssVariableValue('--claro-texto');
        const icon = type === 'error' ? 'exclamation-circle' : 'check-circle';

        container.innerHTML = messages.map(msg => `
            <div class="notification" style="
                background: ${bgColor};
                color: ${textColor};
                padding: 12px;
                margin: 8px 0;
                border-radius: 8px;
                border-left: 4px solid ${borderColor};
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            ">
                <i class="fas fa-${icon}"></i>
                ${this.escapeHtml(msg)}
            </div>
        `).join('');

        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    },

    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // === FUNÇÕES AUXILIARES ===
    getCategoryIcon: function (category) {
        const icons = {
            'trabalho': 'fas fa-briefcase',
            'estudos': 'fas fa-graduation-cap',
            'pessoal': 'fas fa-home',
            'saude': 'fas fa-heart'
        };
        return icons[category] || 'fas fa-tag';
    },

    getPriorityIcon: function (priority) {
        const icons = {
            'alta': 'fas fa-exclamation-circle',
            'media': 'fas fa-exclamation-triangle',
            'baixa': 'fas fa-info-circle'
        };
        return icons[priority] || 'fas fa-circle';
    },

    formatCategoryName: function (category) {
        const names = {
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'pessoal': 'Pessoal',
            'saude': 'Saúde'
        };
        return names[category] || category;
    },

    formatPriorityName: function (priority) {
        const names = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };
        return names[priority] || priority;
    },

    formatDate: function (dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    },

    // Nova função para obter valores de variáveis CSS
    getCssVariableValue: function (variableName) {
        return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    },

    // Funções para obter cores baseadas nas variáveis CSS
    getCategoryColor: function (category) {
        // Use as cores padrão do tema
        return this.getCssVariableValue('--claro-texto');
    },

    getPriorityColor: function (priority) {
        // Use as cores padrão do tema
        return this.getCssVariableValue('--claro-texto');
    }
};

// Inicializar automaticamente quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    taskUI.init();
});