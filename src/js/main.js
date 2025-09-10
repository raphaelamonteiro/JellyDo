// main.js - Ponto de entrada da aplicação (refatorado)
import { taskManager } from './modules/tasks.js';
import { taskUI } from './modules/ui.js';

// Configuração de logging (útil para desenvolvimento)
const LOGGING_ENABLED = true;

const log = {
    info: (message, data = null) => {
        if (LOGGING_ENABLED) {
            console.log(`ℹ️ ${message}`, data || '');
        }
    },
    error: (message, error = null) => {
        if (LOGGING_ENABLED) {
            console.error(`❌ ${message}`, error || '');
        }
    },
    success: (message) => {
        if (LOGGING_ENABLED) {
            console.log(`✅ ${message}`);
        }
    }
};

// Inicializa a aplicação
export const initializeApp = () => {
    log.info('Inicializando aplicação...');

    try {
        // Inicializa a UI (que agora inclui renderização e filtros)
        taskUI.init();
        log.success('UI inicializada com sucesso');

        // Configura o event listener do formulário
        setupFormListener();

    } catch (error) {
        log.error('Erro ao inicializar aplicação:', error);
        showFatalError('Erro ao carregar a aplicação. Recarregue a página.');
    }
};

// Configura o listener do formulário
const setupFormListener = () => {
    const form = document.getElementById('task-form');

    if (form) {
        // Remove listener antigo se existir (para evitar duplicação)
        form.removeEventListener('submit', handleFormSubmit);
        form.addEventListener('submit', handleFormSubmit);
        log.success('Event listener do formulário configurado');
    } else {
        log.error('Formulário não encontrado!');
    }
};

// Manipula o envio do formulário
const handleFormSubmit = (event) => {
    event.preventDefault();
    log.info('Processando envio do formulário...');

    try {
        const formData = getFormData();
        log.info('Dados do formulário coletados:', formData);

        const result = taskManager.addTask(formData);

        if (result.success) {
            handleFormSuccess(result);
        } else {
            handleFormErrors(result.errors);
        }

    } catch (error) {
        log.error('Erro inesperado ao processar formulário:', error);
        taskUI.showErrors(['Erro inesperado. Tente novamente.']);
    }
};

// Obtém dados do formulário de forma segura
const getFormData = () => {
    const getValue = (id) => {
        const element = document.getElementById(id);
        return element ? element.value : '';
    };

    return {
        name: getValue('task-name'),
        category: getValue('task-category'),
        priority: getValue('task-priority'),
        date: getValue('task-date')
    };
};

// Manipula sucesso no envio do formulário
const handleFormSuccess = (result) => {
    log.success('Tarefa adicionada com sucesso:', result.task);

    // A UI agora se atualiza automaticamente através do sistema de eventos
    // Mas garantimos que está sincronizada
    taskUI.renderTasks();
    taskUI.clearForm();
    taskUI.showSuccess('Tarefa adicionada com sucesso!');
};

// Manipula erros do formulário
const handleFormErrors = (errors) => {
    log.error('Erros de validação encontrados:', errors);
    taskUI.showErrors(errors);

    // Destaca campos inválidos (opcional)
    highlightInvalidFields(errors);
};

// Destaca campos inválidos (melhoria UX)
const highlightInvalidFields = (errors) => {
    // Remove highlights anteriores
    document.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });

    // Aplica highlight baseado nos erros
    errors.forEach(error => {
        if (error.includes('nome')) {
            document.getElementById('task-name')?.classList.add('input-error');
        } else if (error.includes('categoria')) {
            document.getElementById('task-category')?.classList.add('input-error');
        } else if (error.includes('prioridade')) {
            document.getElementById('task-priority')?.classList.add('input-error');
        } else if (error.includes('data')) {
            document.getElementById('task-date')?.classList.add('input-error');
        }
    });
};

// Mostra erro fatal (para erros de inicialização)
const showFatalError = (message) => {
    const appContainer = document.getElementById('app') || document.body;
    appContainer.innerHTML = `
        <div style="
            padding: 2rem;
            text-align: center;
            color: #dc3545;
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 8px;
            margin: 2rem;
        ">
            <h2>⚠️ Erro na Aplicação</h2>
            <p>${message}</p>
            <button onclick="window.location.reload()" style="
                padding: 8px 16px;
                background: #dc3545;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 1rem;
            ">
                Recarregar
            </button>
        </div>
    `;
};

// Inicia a aplicação quando o DOM estiver pronto
log.info('Aguardando DOM...');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    // DOM já está pronto
    initializeApp();
}

// Expõe funções globais para debug (apenas desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    window.taskManager = taskManager;
    window.taskUI = taskUI;
    window.debugApp = {
        reload: () => initializeApp(),
        getTasks: () => taskManager.getTasks(),
        clearAll: () => {
            localStorage.clear();
            initializeApp();
        }
    };
}