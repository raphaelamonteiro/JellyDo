// Corrige os caminhos para a pasta modules
import { taskManager } from './modules/tasks.js';
import { taskUI } from './modules/ui.js';

// Inicializa a aplicação
export const initializeApp = () => {
    console.log('🚀 Inicializando aplicação...');

    // Carrega tarefas ao iniciar
    taskUI.renderTasks();

    // Configura o event listener do formulário
    const form = document.getElementById('task-form');

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
        console.log('✅ Event listener adicionado ao formulário');
    } else {
        console.error('❌ Formulário não encontrado!');
    }
};

// Manipula o envio do formulário
const handleFormSubmit = (event) => {
    console.log('📤 Formulário enviado');
    event.preventDefault();

    const formData = {
        name: document.getElementById('task-name').value,
        category: document.getElementById('task-category').value,
        priority: document.getElementById('task-priority').value,
        date: document.getElementById('task-date').value
    };

    console.log('📋 Dados do formulário:', formData);

    const result = taskManager.addTask(formData);
    console.log('📊 Resultado:', result);

    if (result.success) {
        console.log('✅ Tarefa adicionada com sucesso');
        taskUI.clearForm();
        taskUI.renderTasks();
    } else {
        console.log('❌ Erros encontrados:', result.errors);
        taskUI.showErrors(result.errors);
    }
};

// Inicia a aplicação quando o DOM estiver pronto
console.log('⏳ Aguardando DOM...');
document.addEventListener('DOMContentLoaded', initializeApp);