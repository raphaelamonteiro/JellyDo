// tasks.js - Módulo principal de gerenciamento de tarefas

// Importa o módulo de storage
import { taskStorage } from './storage.js';

// Objecto principal que será exportado
export const taskManager = {
    // === OPERAÇÕES BÁSICAS (CRUD) ===

    // Cria objeto tarefa
    createTask: (name, category, priority, date) => {
        return {
            id: taskManager.generateId(),
            name: name.trim(),
            category,
            priority,
            date,
            completed: false,
            createdAt: new Date().toISOString()
        };
    },

    // Adiciona uma nova tarefa
    addTask: (taskData) => {
        // Valida os dados primeiro
        const validation = taskManager.validateTask(taskData);

        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        try {
            // Cria objeto da tarefa
            const newTask = taskManager.createTaskObject(taskData);

            // Adiciona ao storage
            const updatedTasks = taskStorage.addTask(newTask);

            return {
                success: true,
                task: newTask,
                tasks: updatedTasks
            };

        } catch (error) {
            return {
                success: false,
                errors: ['Erro ao salvar tarefa: ' + error.message]
            };
        }
    },

    // Remove uma tarefa existente
    // Remove uma tarefa
    removeTask: (taskId) => {
        try {
            const updatedTasks = taskStorage.deleteTask(taskId);
            return {
                success: true,
                tasks: updatedTasks
            };
        } catch (error) {
            return {
                success: false,
                errors: ['Erro ao excluir tarefa: ' + error.message]
            };
        }
    },

    // Alterna status de conclusão
    toggleTask: (taskId) => {
        try {
            const updatedTasks = taskStorage.toggleTask(taskId);
            return {
                success: true,
                tasks: updatedTasks
            };
        } catch (error) {
            return {
                success: false,
                errors: ['Erro ao atualizar tarefa: ' + error.message]
            };
        }
    },

    // Valida os dados de uma tarefa
    validateTask: (taskData) => {
        const errors = [];

        // Valida nome
        if (!taskData.name || taskData.name.trim().length < 3) {
            errors.push('O nome da tarefa deve ter pelo menos 3 caracteres');
        }

        // Valida categoria
        const validCategories = ['trabalho', 'estudos', 'pessoal', 'saude'];
        if (!taskData.category || !validCategories.includes(taskData.category)) {
            errors.push('Selecione uma categoria válida');
        }

        // Valida prioridade
        const validPriorities = ['alta', 'media', 'baixa'];
        if (!taskData.priority || !validPriorities.includes(taskData.priority)) {
            errors.push('Selecione uma prioridade válida');
        }

        // Valida data
        if (!taskData.date) {
            errors.push('Selecione uma data limite');
        } else {
            const selectedDate = new Date(taskData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                errors.push('A data não pode ser anterior a hoje');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },

    // === UTILITÁRIOS INTERNOS ===

    // Gera ID único para tarefas
    generateId: () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    },

    // Cria objeto tarefa padronizado
    createTaskObject: (taskData) => {
        return {
            id: taskManager.generateId(),
            name: taskData.name.trim(),
            category: taskData.category,
            priority: taskData.priority,
            date: taskData.date,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    },

    // Obtém todas as tarefas
    getTasks: () => {
        try {
            return taskStorage.getTasks();
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        }
    }
};