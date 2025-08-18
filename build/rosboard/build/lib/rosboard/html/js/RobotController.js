/**
 * RobotController - модуль для управления роботами через ROS2 топики
 */
class RobotController {
    constructor(transport) {
        if (!transport) {
            throw new Error('Transport is required for RobotController');
        }
        
        this.transport = transport;
        this.commands = new Map();
        this.callbacks = new Map();
        this.isConnected = false;
        
        // Сохраняем оригинальные обработчики
        this.originalOnMsg = this.transport.onMsg;
        
        // Перехватываем сообщения для обработки команд
        this.transport.onMsg = (data) => {
            // Обрабатываем ответы на команды
            this.handleCommandResponse(data);
            
            // Вызываем оригинальный обработчик, если он есть
            if (this.originalOnMsg) {
                this.originalOnMsg(data);
            }
        };
        
        // Регистрируем стандартные команды
        this.registerDefaultCommands();
        
        console.log('RobotController initialized successfully');
    }
    
    /**
     * Регистрирует новую команду управления роботом
     * @param {string} commandName - имя команды
     * @param {Object} config - конфигурация команды
     * @param {string} config.topic - ROS2 топик
     * @param {string} config.label - отображаемое название
     * @param {string} config.buttonClass - CSS класс кнопки
     * @param {Function} config.onSuccess - callback при успехе
     * @param {Function} config.onError - callback при ошибке
     */
    registerCommand(commandName, config) {
        this.commands.set(commandName, {
            topic: config.topic,
            label: config.label || commandName,
            buttonClass: config.buttonClass || 'mdl-button--raised mdl-button--colored',
            onSuccess: config.onSuccess || this.defaultSuccessCallback,
            onError: config.onError || this.defaultErrorCallback,
            ...config
        });
    }
    
    /**
     * Выполняет команду управления роботом
     * @param {string} commandName - имя команды
     * @param {Object} data - данные для отправки
     */
    executeCommand(commandName, data = {}) {
        const command = this.commands.get(commandName);
        if (!command) {
            console.error(`Command "${commandName}" not found`);
            return;
        }
        
        if (!this.transport || !this.transport.isConnected()) {
            console.error('Transport not connected');
            return;
        }
        
        const message = {
            type: 'robot_control',
            topic: command.topic,
            msg: {
                data: data.value !== undefined ? data.value : true
            }
        };
        
        // Сохраняем callback для обработки ответа
        const callbackId = `${commandName}_${Date.now()}`;
        this.callbacks.set(callbackId, {
            command: command,
            data: data
        });
        
        // Отправляем команду
        try {
            this.transport.ws.send(JSON.stringify(['c', message]));
            console.log(`Command sent: ${commandName} to ${command.topic}`);
        } catch (error) {
            console.error(`Failed to send command ${commandName}:`, error);
            command.onError(data, { status: 'error', message: 'Failed to send command' });
            return;
        }
        
        // Очищаем callback через 5 секунд
        setTimeout(() => {
            if (this.callbacks.has(callbackId)) {
                console.log(`Command ${commandName} timed out`);
                this.callbacks.delete(callbackId);
            }
        }, 5000);
    }
    
    /**
     * Обрабатывает ответы на команды
     */
    handleCommandResponse(data) {
        // Проверяем, что это ответ на команду (формат: ['cr', {...}])
        if (!Array.isArray(data) || data.length < 2 || data[0] !== 'cr') {
            return; // Не ответ на команду
        }
        
        const response = data[1];
        const { status, command_type, topic, message } = response;
        
        console.log(`Command response: ${status} - ${message}`);
        
        // Находим соответствующий callback
        for (const [callbackId, callbackData] of this.callbacks) {
            if (callbackData.command.topic === topic) {
                if (status === 'success') {
                    callbackData.command.onSuccess(callbackData.data, response);
                } else {
                    callbackData.command.onError(callbackData.data, response);
                }
                this.callbacks.delete(callbackId);
                break;
            }
        }
    }
    
    /**
     * Создает UI элементы для всех зарегистрированных команд
     * @param {string} containerId - ID контейнера для кнопок
     */
    createUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with ID "${containerId}" not found`);
            return;
        }
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Создаем заголовок
        const title = document.createElement('h5');
        title.textContent = 'Robot Controls';
        title.style.marginBottom = '16px';
        container.appendChild(title);
        
        // Создаем кнопки для каждой команды
        for (const [commandName, command] of this.commands) {
            const button = document.createElement('button');
            button.id = `${commandName}-button`;
            button.className = `mdl-button mdl-js-button ${command.buttonClass}`;
            button.textContent = command.label;
            button.style.marginRight = '8px';
            button.style.marginBottom = '8px';
            
            // Добавляем обработчик клика
            button.addEventListener('click', () => {
                this.executeCommand(commandName);
            });
            
            container.appendChild(button);
        }
        
        // Обновляем Material Design компоненты
        if (window.componentHandler) {
            window.componentHandler.upgradeElements(container);
        } else if (window.MaterialSnackbar) {
            // Альтернативный способ обновления компонентов
            setTimeout(() => {
                if (window.componentHandler) {
                    window.componentHandler.upgradeElements(container);
                }
            }, 100);
        }
    }
    
    /**
     * Регистрирует стандартные команды управления
     */
    registerDefaultCommands() {
        // Команда старта
        this.registerCommand('start', {
            topic: '/brake/turnOn',
            label: 'Start',
            buttonClass: 'mdl-button--raised mdl-button--colored',
            onSuccess: (data, response) => {
                this.showNotification('Robot started successfully!', 'success');
            },
            onError: (data, response) => {
                this.showNotification('Failed to start robot', 'error');
            }
        });
        
        // Команда остановки
        this.registerCommand('stop', {
            topic: '/brake/turnOff',
            label: 'Stop',
            buttonClass: 'mdl-button--raised mdl-button--accent',
            onSuccess: (data, response) => {
                this.showNotification('Robot stopped successfully!', 'success');
            },
            onError: (data, response) => {
                this.showNotification('Failed to stop robot', 'error');
            }
        });
        
        // Команда аварийной остановки
        this.registerCommand('emergency_stop', {
            topic: '/emergency_stop',
            label: 'Emergency Stop',
            buttonClass: 'mdl-button--raised mdl-button--accent',
            onSuccess: (data, response) => {
                this.showNotification('Emergency stop activated!', 'warning');
            },
            onError: (data, response) => {
                this.showNotification('Failed to activate emergency stop', 'error');
            }
        });
    }
    
    /**
     * Показывает уведомление пользователю
     */
    showNotification(message, type = 'info') {
        const snackbarContainer = document.querySelector('#demo-toast-example');
        if (snackbarContainer && snackbarContainer.MaterialSnackbar) {
            const data = {
                message: message,
                timeout: 3000
            };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        } else {
            // Fallback: используем alert если snackbar недоступен
            alert(`[${type.toUpperCase()}] ${message}`);
        }
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
    
    /**
     * Стандартный callback при успешном выполнении команды
     */
    defaultSuccessCallback(data, response) {
        console.log('Command executed successfully:', response);
    }
    
    /**
     * Стандартный callback при ошибке выполнения команды
     */
    defaultErrorCallback(data, response) {
        console.error('Command execution failed:', response);
    }
    
    /**
     * Устанавливает соединение с сервером
     */
    connect() {
        this.isConnected = true;
        console.log('RobotController connected');
    }
    
    /**
     * Разрывает соединение с сервером
     */
    disconnect() {
        this.isConnected = false;
        console.log('RobotController disconnected');
    }
}

// Экспортируем класс для использования в других модулях
window.RobotController = RobotController;
