// tasks.js - Módulo principal de gerenciamento de tarefas (refatorado)
import { taskStorage } from './storage.js';

// Constantes para validação (evita "magic strings")
const VALID_CATEGORIES = ['trabalho', 'estudos', 'pessoal', 'saude'];
const VALID_PRIORITIES = ['alta', 'media', 'baixa'];
const MIN_NAME_LENGTH = 3;

// Mensagens de erro centralizadas
const ERROR_MESSAGES = {
    INVALID_NAME: `O nome da tarefa deve ter pelo menos ${MIN_NAME_LENGTH} caracteres`,
    INVALID_CATEGORY: 'Selecione uma categoria válida',
    INVALID_PRIORITY: 'Selecione uma prioridade válida',
    INVALID_DATE: 'Selecione uma data limite',
    PAST_DATE: 'A data não pode ser anterior a hoje',
    SAVE_ERROR: 'Erro ao salvar tarefa: ',
    DELETE_ERROR: 'Erro ao excluir tarefa: ',
    UPDATE_ERROR: 'Erro ao atualizar tarefa: ',
    LOAD_ERROR: 'Erro ao carregar tarefas: '
};

export const taskManager = {
    // === OPERAÇÕES BÁSICAS (CRUD) ===

    /**
     * Cria um novo objeto tarefa
     * @param {string} name - Nome da tarefa
     * @param {string} category - Categoria da tarefa
     * @param {string} priority - Prioridade da tarefa
     * @param {string} date - Data limite da tarefa
     * @returns {Object} Objeto tarefa
     */
    createTask: (name, category, priority, date) => {
        const now = new Date().toISOString();

        return {
            id: taskManager.generateId(),
            name: name.trim(),
            category,
            priority,
            date,
            completed: false,
            createdAt: now,
            updatedAt: now
        };
    },

    /**
     * Adiciona uma nova tarefa
     * @param {Object} taskData - Dados da tarefa
     * @returns {Object} Resultado da operação
     */
    addTask: (taskData) => {
        const validation = taskManager.validateTask(taskData);

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        try {
            const newTask = taskManager.createTask(
                taskData.name,
                taskData.category,
                taskData.priority,
                taskData.date
            );

            const updatedTasks = taskStorage.addTask(newTask);

            return {
                success: true,
                task: newTask,
                tasks: updatedTasks,
                message: 'Tarefa adicionada com sucesso!'
            };

        } catch (error) {
            return {
                success: false,
                errors: [ERROR_MESSAGES.SAVE_ERROR + error.message]
            };
        }
    },

    /**
     * Remove uma tarefa existente
     * @param {string} taskId - ID da tarefa
     * @returns {Object} Resultado da operação
     */
    removeTask: (taskId) => {
        if (!taskId) {
            return {
                success: false,
                errors: ['ID da tarefa é obrigatório']
            };
        }

        try {
            const updatedTasks = taskStorage.deleteTask(taskId);

            return {
                success: true,
                tasks: updatedTasks,
                message: 'Tarefa excluída com sucesso!'
            };

        } catch (error) {
            return {
                success: false,
                errors: [ERROR_MESSAGES.DELETE_ERROR + error.message]
            };
        }
    },

    /**
     * Alterna status de conclusão da tarefa
     * @param {string} taskId - ID da tarefa
     * @returns {Object} Resultado da operação
     */
    toggleTask: (taskId) => {
        if (!taskId) {
            return {
                success: false,
                errors: ['ID da tarefa é obrigatório']
            };
        }

        try {
            const updatedTasks = taskStorage.toggleTask(taskId);
            const task = updatedTasks.find(t => t.id === taskId);

            return {
                success: true,
                tasks: updatedTasks,
                completed: task?.completed || false,
                message: task?.completed ? 'Tarefa concluída!' : 'Tarefa reaberta!'
            };

        } catch (error) {
            return {
                success: false,
                errors: [ERROR_MESSAGES.UPDATE_ERROR + error.message]
            };
        }
    },

    /**
     * Valida os dados de uma tarefa
     * @param {Object} taskData - Dados da tarefa
     * @returns {Object} Resultado da validação
     */
    validateTask: (taskData) => {
        const errors = [];

        // Valida nome
        if (!taskData.name || taskData.name.trim().length < MIN_NAME_LENGTH) {
            errors.push(ERROR_MESSAGES.INVALID_NAME);
        }

        // Valida categoria
        if (!taskData.category || !VALID_CATEGORIES.includes(taskData.category)) {
            errors.push(ERROR_MESSAGES.INVALID_CATEGORY);
        }

        // Valida prioridade
        if (!taskData.priority || !VALID_PRIORITIES.includes(taskData.priority)) {
            errors.push(ERROR_MESSAGES.INVALID_PRIORITY);
        }

        // Valida data
        if (!taskData.date) {
            errors.push(ERROR_MESSAGES.INVALID_DATE);
        } else {
            const selectedDate = new Date(taskData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                errors.push(ERROR_MESSAGES.PAST_DATE);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    // === OPERAÇÕES AVANÇADAS ===

    /**
     * Busca tarefas por termo
     * @param {string} searchTerm - Termo de busca
     * @returns {Array} Tarefas filtradas
     */
    searchTasks: (searchTerm) => {
        if (!searchTerm || searchTerm.trim().length < 2) {
            return taskManager.getTasks();
        }

        const tasks = taskManager.getTasks();
        const term = searchTerm.toLowerCase().trim();

        return tasks.filter(task =>
            task.name.toLowerCase().includes(term) ||
            task.category.toLowerCase().includes(term) ||
            task.priority.toLowerCase().includes(term)
        );
    },

    /**
     * Filtra tarefas por múltiplos critérios
     * @param {Object} filters - Filtros a aplicar
     * @returns {Array} Tarefas filtradas
     */
    filterTasks: (filters = {}) => {
        let tasks = taskManager.getTasks();

        // Aplicar filtros sequencialmente
        if (filters.category && filters.category !== 'all') {
            tasks = tasks.filter(task => task.category === filters.category);
        }

        if (filters.priority && filters.priority !== 'all') {
            tasks = tasks.filter(task => task.priority === filters.priority);
        }

        if (filters.status && filters.status !== 'all') {
            const completed = filters.status === 'completed';
            tasks = tasks.filter(task => task.completed === completed);
        }

        if (filters.search) {
            tasks = taskManager.searchTasks(filters.search);
        }

        return tasks;
    },

    // === UTILITÁRIOS ===

    /**
     * Gera ID único para tarefas
     * @returns {string} ID único
     */
    generateId: () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Obtém todas as tarefas
     * @returns {Array} Lista de tarefas
     */
    getTasks: () => {
        try {
            return taskStorage.getTasks();
        } catch (error) {
            console.error(ERROR_MESSAGES.LOAD_ERROR, error);
            return [];
        }
    },

    /**
     * Obtém estatísticas das tarefas
     * @returns {Object} Estatísticas
     */
    getStats: () => {
        const tasks = taskManager.getTasks();
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;

        const byCategory = VALID_CATEGORIES.reduce((acc, category) => {
            acc[category] = tasks.filter(task => task.category === category).length;
            return acc;
        }, {});

        const byPriority = VALID_PRIORITIES.reduce((acc, priority) => {
            acc[priority] = tasks.filter(task => task.priority === priority).length;
            return acc;
        }, {});

        return {
            total,
            completed,
            pending,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            byCategory,
            byPriority
        };
    },

    /**
     * Limpa todas as tarefas concluídas
     * @returns {Object} Resultado da operação
     */
    clearCompleted: () => {
        try {
            const tasks = taskManager.getTasks();
            const activeTasks = tasks.filter(task => !task.completed);

            taskStorage.saveTasks(activeTasks);

            return {
                success: true,
                tasks: activeTasks,
                message: 'Tarefas concluídas removidas!',
                removedCount: tasks.length - activeTasks.length
            };

        } catch (error) {
            return {
                success: false,
                errors: ['Erro ao limpar tarefas concluídas: ' + error.message]
            };
        }
    }
};