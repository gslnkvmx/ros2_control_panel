/**
 * Пример расширения RobotController с дополнительными командами
 * Этот файл демонстрирует, как легко добавлять новые команды управления
 */

// Функция для добавления дополнительных команд к существующему контроллеру
function addCustomRobotCommands(robotController) {
    if (!robotController) {
        console.error('RobotController not initialized');
        return;
    }
    
    // Команда для управления скоростью
    robotController.registerCommand('set_speed', {
        topic: '/robot/speed',
        label: 'Set Speed',
        buttonClass: 'mdl-button--raised mdl-button--colored',
        onSuccess: (data, response) => {
            robotController.showNotification('Speed updated successfully!', 'success');
        },
        onError: (data, response) => {
            robotController.showNotification('Failed to update speed', 'error');
        }
    });
    
    // Команда для управления направлением
    robotController.registerCommand('set_direction', {
        topic: '/robot/direction',
        label: 'Set Direction',
        buttonClass: 'mdl-button--raised mdl-button--colored',
        onSuccess: (data, response) => {
            robotController.showNotification('Direction updated successfully!', 'success');
        },
        onError: (data, response) => {
            robotController.showNotification('Failed to update direction', 'error');
        }
    });
    
    // Команда для включения/выключения света
    robotController.registerCommand('toggle_lights', {
        topic: '/robot/lights',
        label: 'Toggle Lights',
        buttonClass: 'mdl-button--raised mdl-button--accent',
        onSuccess: (data, response) => {
            robotController.showNotification('Lights toggled successfully!', 'success');
        },
        onError: (data, response) => {
            robotController.showNotification('Failed to toggle lights', 'error');
        }
    });
    
    // Команда для калибровки
    robotController.registerCommand('calibrate', {
        topic: '/robot/calibrate',
        label: 'Calibrate',
        buttonClass: 'mdl-button--raised mdl-button--accent',
        onSuccess: (data, response) => {
            robotController.showNotification('Calibration completed!', 'success');
        },
        onError: (data, response) => {
            robotController.showNotification('Calibration failed', 'error');
        }
    });
    
    console.log('Custom robot commands added successfully');
}

// Функция для создания расширенного UI с дополнительными элементами управления
function createAdvancedRobotUI(robotController, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем заголовок
    const title = document.createElement('h5');
    title.textContent = 'Advanced Robot Controls';
    title.style.marginBottom = '16px';
    container.appendChild(title);
    
    // Создаем секцию основных команд
    const basicSection = document.createElement('div');
    basicSection.style.marginBottom = '24px';
    
    const basicTitle = document.createElement('h6');
    basicTitle.textContent = 'Basic Controls';
    basicTitle.style.marginBottom = '12px';
    basicSection.appendChild(basicTitle);
    
    // Добавляем основные команды
    const basicCommands = ['start', 'stop', 'emergency_stop'];
    basicCommands.forEach(commandName => {
        const command = robotController.commands.get(commandName);
        if (command) {
            const button = document.createElement('button');
            button.id = `${commandName}-button`;
            button.className = `mdl-button mdl-js-button ${command.buttonClass}`;
            button.textContent = command.label;
            button.style.marginRight = '8px';
            button.style.marginBottom = '8px';
            
            button.addEventListener('click', () => {
                robotController.executeCommand(commandName);
            });
            
            basicSection.appendChild(button);
        }
    });
    
    container.appendChild(basicSection);
    
    // Создаем секцию расширенных команд
    const advancedSection = document.createElement('div');
    advancedSection.style.marginBottom = '24px';
    
    const advancedTitle = document.createElement('h6');
    advancedTitle.textContent = 'Advanced Controls';
    advancedTitle.style.marginBottom = '12px';
    advancedSection.appendChild(advancedTitle);
    
    // Добавляем расширенные команды
    const advancedCommands = ['set_speed', 'set_direction', 'toggle_lights', 'calibrate'];
    advancedCommands.forEach(commandName => {
        const command = robotController.commands.get(commandName);
        if (command) {
            const button = document.createElement('button');
            button.id = `${commandName}-button`;
            button.className = `mdl-button mdl-js-button ${command.buttonClass}`;
            button.textContent = command.label;
            button.style.marginRight = '8px';
            button.style.marginBottom = '8px';
            
            button.addEventListener('click', () => {
                robotController.executeCommand(commandName);
            });
            
            advancedSection.appendChild(button);
        }
    });
    
    container.appendChild(advancedSection);
    
    // Создаем секцию с числовыми параметрами
    const paramsSection = document.createElement('div');
    paramsSection.style.marginBottom = '24px';
    
    const paramsTitle = document.createElement('h6');
    paramsTitle.textContent = 'Parameters';
    paramsTitle.style.marginBottom = '12px';
    paramsSection.appendChild(paramsTitle);
    
    // Создаем слайдер для скорости
    const speedContainer = document.createElement('div');
    speedContainer.style.marginBottom = '16px';
    
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Speed: ';
    speedLabel.style.marginRight = '8px';
    speedContainer.appendChild(speedLabel);
    
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0';
    speedSlider.max = '100';
    speedSlider.value = '50';
    speedSlider.style.width = '150px';
    speedSlider.style.marginRight = '8px';
    speedContainer.appendChild(speedSlider);
    
    const speedValue = document.createElement('span');
    speedValue.textContent = '50';
    speedContainer.appendChild(speedValue);
    
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = speedSlider.value;
    });
    
    const speedButton = document.createElement('button');
    speedButton.className = 'mdl-button mdl-js-button mdl-button--raised mdl-button--colored';
    speedButton.textContent = 'Set Speed';
    speedButton.style.marginLeft = '8px';
    speedButton.addEventListener('click', () => {
        robotController.executeCommand('set_speed', { value: parseInt(speedSlider.value) });
    });
    speedContainer.appendChild(speedButton);
    
    paramsSection.appendChild(speedContainer);
    container.appendChild(paramsSection);
    
    // Обновляем Material Design компоненты
    if (window.componentHandler) {
        window.componentHandler.upgradeElements(container);
    }
}

// Экспортируем функции для использования в других модулях
window.addCustomRobotCommands = addCustomRobotCommands;
window.createAdvancedRobotUI = createAdvancedRobotUI;
