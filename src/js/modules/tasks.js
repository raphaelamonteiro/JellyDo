// tasks.js - Lógica de gerenciamento de tarefas
import { taskStorage } from './storage.js';

export const taskManager = {
    // Gera ID único para cada tarefa
    generateId: () => Date.now().toString(),

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

    // Valida dados do formulário
    validateTask: (name, category, priority, date) => {
        const errors = [];

        if (!name.trim()) errors.push('Nome é obrigatório');
        if (!category) errors.push('Categoria é obrigatória');
        if (!priority) errors.push('Prioridade é obrigatória');
        if (!date) errors.push('Data é obrigatória');

        return errors;
    },

    // Adiciona tarefa
    addTask: (taskData) => {
        const errors = taskManager.validateTask(
            taskData.name,
            taskData.category,
            taskData.priority,
            taskData.date
        );

        if (errors.length > 0) {
            return { success: false, errors };
        }

        const task = taskManager.createTask(
            taskData.name,
            taskData.category,
            taskData.priority,
            taskData.date
        );

        const updatedTasks = taskStorage.addTask(task);
        return updatedTasks
            ? { success: true, tasks: updatedTasks }
            : { success: false, errors: ['Erro ao salvar tarefa'] };
    },

    // Remove tarefa
    removeTask: (taskId) => {
        const updatedTasks = taskStorage.deleteTask(taskId);
        return updatedTasks || [];
    },

    // Alterna status da tarefa
    toggleTask: (taskId) => {
        const updatedTasks = taskStorage.toggleTask(taskId);
        return updatedTasks || [];
    },

    // Pega todas as tarefas
    getTasks: () => {
        return taskStorage.getTasks();
    }
};