// storage.js - Funções para salvar e recuperar tarefas (versão robusta)

// Constantes para evitar "magic strings"
const STORAGE_KEYS = {
    TASKS: 'jellydo_tasks'
};

// Mensagens de erro padronizadas
const STORAGE_ERRORS = {
    SAVE_FAILED: 'Falha ao salvar tarefas no storage',
    LOAD_FAILED: 'Falha ao carregar tarefas do storage',
    PARSE_FAILED: 'Falha ao interpretar dados do storage',
    QUOTA_EXCEEDED: 'Storage cheio. Limpe algumas tarefas.'
};

export const taskStorage = {
    /**
     * Salva tarefas no localStorage com tratamento de erro
     * @param {Array} tasks - Array de tarefas
     * @returns {boolean} - true se salvou com sucesso
     */
    saveTasks: (tasks) => {
        try {
            if (!Array.isArray(tasks)) {
                throw new Error('Dados inválidos: deve ser um array');
            }

            localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            return true;

        } catch (error) {
            console.error(STORAGE_ERRORS.SAVE_FAILED, error);

            // Verifica se é erro de quota (storage cheio)
            if (error.name === 'QuotaExceededError') {
                console.error(STORAGE_ERRORS.QUOTA_EXCEEDED);
            }

            return false;
        }
    },

    /**
     * Carrega tarefas do localStorage com tratamento de erro
     * @returns {Array} - Array de tarefas (vazio se erro)
     */
    getTasks: () => {
        try {
            const tasksJson = localStorage.getItem(STORAGE_KEYS.TASKS);

            if (!tasksJson) {
                return []; // Retorna array vazio se não existir
            }

            const tasks = JSON.parse(tasksJson);

            // Valida se é um array
            if (!Array.isArray(tasks)) {
                console.warn('Dados corrompidos no storage, resetando...');
                taskStorage.saveTasks([]); // Corrige dados corrompidos
                return [];
            }

            return tasks;

        } catch (error) {
            console.error(STORAGE_ERRORS.LOAD_FAILED, error);
            return [];
        }
    },

    /**
     * Adiciona uma nova tarefa
     * @param {Object} task - Objeto tarefa
     * @returns {Array|null} - Novo array de tarefas ou null se erro
     */
    addTask: (task) => {
        try {
            const tasks = taskStorage.getTasks();

            // Validação básica da tarefa
            if (!task || typeof task !== 'object') {
                throw new Error('Tarefa inválida');
            }

            tasks.push(task);
            return taskStorage.saveTasks(tasks) ? tasks : null;

        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            return null;
        }
    },

    /**
     * Remove uma tarefa pelo ID
     * @param {string} taskId - ID da tarefa
     * @returns {Array|null} - Novo array de tarefas ou null se erro
     */
    deleteTask: (taskId) => {
        try {
            if (!taskId) {
                throw new Error('ID da tarefa é obrigatório');
            }

            const tasks = taskStorage.getTasks();
            const filteredTasks = tasks.filter(task => task.id !== taskId);

            return taskStorage.saveTasks(filteredTasks) ? filteredTasks : null;

        } catch (error) {
            console.error('Erro ao remover tarefa:', error);
            return null;
        }
    },

    /**
     * Alterna status de conclusão de uma tarefa
     * @param {string} taskId - ID da tarefa
     * @returns {Array|null} - Novo array de tarefas ou null se erro
     */
    toggleTask: (taskId) => {
        try {
            if (!taskId) {
                throw new Error('ID da tarefa é obrigatório');
            }

            const tasks = taskStorage.getTasks();
            const updatedTasks = tasks.map(task =>
                task.id === taskId
                    ? {
                        ...task,
                        completed: !task.completed,
                        updatedAt: new Date().toISOString() // Marca timestamp de atualização
                    }
                    : task
            );

            return taskStorage.saveTasks(updatedTasks) ? updatedTasks : null;

        } catch (error) {
            console.error('Erro ao alternar tarefa:', error);
            return null;
        }
    },

    /**
     * Limpa todas as tarefas (útil para desenvolvimento)
     * @returns {boolean} - true se limpou com sucesso
     */
    clearAll: () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.TASKS);
            return true;
        } catch (error) {
            console.error('Erro ao limpar storage:', error);
            return false;
        }
    },

    /**
     * Retorna estatísticas do storage
     * @returns {Object} - Estatísticas de uso
     */
    getStorageInfo: () => {
        try {
            const tasks = taskStorage.getTasks();
            const tasksJson = JSON.stringify(tasks);

            return {
                totalTasks: tasks.length,
                storageSize: tasksJson.length,
                storageSizeKB: (tasksJson.length / 1024).toFixed(2)
            };
        } catch (error) {
            console.error('Erro ao obter info do storage:', error);
            return { totalTasks: 0, storageSize: 0, storageSizeKB: '0.00' };
        }
    }
};