// Funções para salvar e recuperar tarefas
export const taskStorage = {
    // Salva tarefas no localStorage
    saveTasks: (tasks) => {
        localStorage.setItem('jellydo_tasks', JSON.stringify(tasks));
    },

    // Pega tarefas do localStorage
    getTasks: () => {
        const tasks = localStorage.getItem('jellydo_tasks');
        return tasks ? JSON.parse(tasks) : [];
    },

    // Adiciona uma tarefa
    addTask: (task) => {
        const tasks = taskStorage.getTasks();
        tasks.push(task);
        taskStorage.saveTasks(tasks);
        return tasks;
    },

    // Remove uma tarefa
    deleteTask: (taskId) => {
        const tasks = taskStorage.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        taskStorage.saveTasks(filteredTasks);
        return filteredTasks;
    },

    // Marca tarefa como concluída
    toggleTask: (taskId) => {
        const tasks = taskStorage.getTasks();
        const updatedTasks = tasks.map(task =>
            task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
        );
        taskStorage.saveTasks(updatedTasks);
        return updatedTasks;
    }
};