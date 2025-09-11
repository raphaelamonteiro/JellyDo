// Gerenciamento de tarefas
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilters = {
            category: 'all',
            priority: 'all',
            status: 'all',
            sort: 'date'
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateCounters();
    }

    bindEvents() {
        // Formulário de nova tarefa
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filtros
        document.getElementById('filter-category').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filter-priority').addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filter-status').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filter-sort').addEventListener('change', (e) => {
            this.currentFilters.sort = e.target.value;
            this.applyFilters();
        });

        // Limpar filtros
        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearFilters();
        });
    }

    addTask() {
        const name = document.getElementById('task-name').value;
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        const date = document.getElementById('task-date').value;

        const task = {
            id: Date.now(),
            name,
            category,
            priority,
            date,
            completed: false,
            createdAt: new Date()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateCounters();

        // Reset form
        document.getElementById('task-form').reset();
    }

    toggleTask(id) {
        this.tasks = this.tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });

        this.saveTasks();
        this.renderTasks();
        this.updateCounters();
    }

    deleteTask(id) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateCounters();
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    applyFilters() {
        this.renderTasks();
    }

    clearFilters() {
        // Adicionar uma animação de feedback
        const clearBtn = document.getElementById('clear-filters');
        clearBtn.classList.add('filter-cleaning');

        // Resetar todos os filtros para valores padrão
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-priority').value = 'all';
        document.getElementById('filter-status').value = 'all';
        document.getElementById('filter-sort').value = 'date';

        // Atualizar os filtros atuais
        this.currentFilters = {
            category: 'all',
            priority: 'all',
            status: 'all',
            sort: 'date'
        };

        // Re-renderizar as tarefas
        this.renderTasks();

        // Remover a classe após a animação
        setTimeout(() => {
            clearBtn.classList.remove('filter-cleaning');
        }, 500);
    }

    filterTasks() {
        let filteredTasks = [...this.tasks];

        // Filtrar por categoria
        if (this.currentFilters.category !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentFilters.category);
        }

        // Filtrar por prioridade
        if (this.currentFilters.priority !== 'all') {
            filteredTasks = filteredTasks.filter(task => task.priority === this.currentFilters.priority);
        }

        // Filtrar por status
        if (this.currentFilters.status !== 'all') {
            const statusFilter = this.currentFilters.status === 'completed';
            filteredTasks = filteredTasks.filter(task => task.completed === statusFilter);
        }
        return filteredTasks;
    }

    renderTasks() {
        const tasksContainer = document.getElementById('tasks-container');
        const filteredTasks = this.filterTasks();

        if (filteredTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                   <i class="fa-solid fa-water"></i>
                    <p>O mar está calmo hoje! </p>
                    <button class="btn-clear-filters" id="clear-filters-empty">Limpar Filtros</button>
                </div>
            `;

            document.getElementById('clear-filters-empty').addEventListener('click', () => {
                this.clearFilters();
            });

            return;
        }

        tasksContainer.innerHTML = filteredTasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}">
                <div class="task-info">
                    <h3>${task.name}</h3>
                    <div class="task-meta">
                        <span class="task-category">
                            <i class="fas fa-tag"></i> 
                            ${this.getCategoryName(task.category)}
                        </span>
                        <span class="task-priority priority-${task.priority}">
                            <i class="fas fa-flag"></i> 
                            ${this.getPriorityName(task.priority)}
                        </span>
                        <span class="task-date">
                            <i class="fas fa-calendar"></i> 
                            ${new Date(task.date).toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn-action btn-toggle" data-id="${task.id}">
                        <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                    </button>
                    <button class="btn-action btn-delete" data-id="${task.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Adicionar event listeners aos botões
        document.querySelectorAll('.btn-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.toggleTask(id);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                this.deleteTask(id);
            });
        });
    }

    updateCounters() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        // Criar ou atualizar contadores
        let countersElement = document.querySelector('.tasks-counters');

        if (!countersElement) {
            countersElement = document.createElement('div');
            countersElement.className = 'tasks-counters';
            document.querySelector('.tasks-section').insertBefore(countersElement, document.getElementById('tasks-container'));
        }

        countersElement.innerHTML = `
            <div class="counter total">
                <i class="fas fa-tasks"></i> Total: ${total}
            </div>
            <div class="counter completed">
                <i class="fas fa-check-circle"></i> Concluídas: ${completed}
            </div>
            <div class="counter pending">
                <i class="fas fa-clock"></i> Pendentes: ${pending}
            </div>
        `;
    }

    getCategoryName(category) {
        const categories = {
            'trabalho': 'Trabalho',
            'estudos': 'Estudos',
            'pessoal': 'Pessoal',
            'saude': 'Saúde'
        };

        return categories[category] || category;
    }

    getPriorityName(priority) {
        const priorities = {
            'alta': 'Alta',
            'media': 'Média',
            'baixa': 'Baixa'
        };

        return priorities[priority] || priority;
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});