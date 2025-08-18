/**
 * RobotControlViewer - специальный viewer для управления роботами
 * Работает как обычная карточка ROSboard с возможностью добавления/удаления
 */

importJsOnce("js/viewers/meta/Viewer.js");

class RobotControlViewer extends Viewer {
    constructor(card, topicName, topicType) {
        super(card, topicName, topicType);
        
        this.robotController = window.robotController;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        // Создаем заголовок карточки
        this.card.addClass('mdl-card mdl-shadow--2dp');
        
        // Создаем заголовок
        const title = $('<div></div>')
            .addClass('mdl-card__title')
            .appendTo(this.card);
        
        $('<h2></h2>')
            .addClass('mdl-card__title-text')
            .text('Robot Controls')
            .appendTo(title);
        
        // Создаем контейнер для кнопок
        this.controlsContainer = $('<div></div>')
            .addClass('mdl-card__supporting-text')
            .css({
                'padding': '16px',
                'text-align': 'center'
            })
            .appendTo(this.card);
        
        // Создаем кнопку закрытия
        const closeButton = $('<button></button>')
            .addClass('mdl-button mdl-js-button mdl-button--icon')
            .css({
                'position': 'absolute',
                'top': '8px',
                'right': '8px'
            })
            .appendTo(this.card);
        
        $('<i></i>')
            .addClass('material-icons')
            .text('close')
            .appendTo(closeButton);
        
        // Обработчик закрытия
        closeButton.click(() => {
            this.destroy();
        });
        
        // Создаем UI управления
        this.createControls();
        
        // Обновляем Material Design компоненты
        if (window.componentHandler) {
            window.componentHandler.upgradeElements(this.card[0]);
        }
        
        this.isInitialized = true;
    }
    
    createControls() {
        if (!this.robotController) {
            this.controlsContainer.html('<p style="color: red;">Robot controller not available</p>');
            return;
        }
        
        // Очищаем контейнер
        this.controlsContainer.empty();
        
        // Создаем секцию основных команд
        const basicSection = this.createSection('Basic Controls');
        
        // Добавляем основные команды
        const basicCommands = ['start', 'stop', 'emergency_stop'];
        basicCommands.forEach(commandName => {
            const command = this.robotController.commands.get(commandName);
            if (command) {
                this.createButton(commandName, command, basicSection);
            }
        });
        
        // Создаем секцию расширенных команд
        const advancedSection = this.createSection('Advanced Controls');
        
        // Добавляем расширенные команды (если есть)
        const advancedCommands = ['set_speed', 'set_direction', 'toggle_lights', 'calibrate'];
        let hasAdvancedCommands = false;
        
        advancedCommands.forEach(commandName => {
            const command = this.robotController.commands.get(commandName);
            if (command) {
                this.createButton(commandName, command, advancedSection);
                hasAdvancedCommands = true;
            }
        });
        
        // Скрываем секцию, если нет расширенных команд
        if (!hasAdvancedCommands) {
            advancedSection.hide();
        }
        
        // Создаем секцию параметров
        this.createParametersSection();
    }
    
    createSection(title) {
        const section = $('<div></div>')
            .css({
                'margin-bottom': '20px',
                'text-align': 'left'
            })
            .appendTo(this.controlsContainer);
        
        $('<h6></h6>')
            .text(title)
            .css({
                'margin': '0 0 12px 0',
                'color': '#666',
                'font-size': '14px',
                'font-weight': 'bold'
            })
            .appendTo(section);
        
        return section;
    }
    
    createButton(commandName, command, container) {
        const button = $('<button></button>')
            .addClass(`mdl-button mdl-js-button ${command.buttonClass}`)
            .text(command.label)
            .css({
                'margin-right': '8px',
                'margin-bottom': '8px',
                'min-width': '80px'
            })
            .appendTo(container);
        
        // Обработчик клика
        button.click(() => {
            this.robotController.executeCommand(commandName);
        });
        
        return button;
    }
    
    createParametersSection() {
        const paramsSection = this.createSection('Parameters');
        
        // Создаем слайдер для скорости (если команда существует)
        if (this.robotController.commands.has('set_speed')) {
            this.createSpeedSlider(paramsSection);
        }
        
        // Создаем слайдер для направления (если команда существует)
        if (this.robotController.commands.has('set_direction')) {
            this.createDirectionSlider(paramsSection);
        }
    }
    
    createSpeedSlider(container) {
        const speedContainer = $('<div></div>')
            .css({
                'margin-bottom': '16px',
                'display': 'flex',
                'align-items': 'center',
                'flex-wrap': 'wrap'
            })
            .appendTo(container);
        
        $('<label></label>')
            .text('Speed: ')
            .css({
                'margin-right': '8px',
                'min-width': '50px'
            })
            .appendTo(speedContainer);
        
        const speedSlider = $('<input></input>')
            .attr({
                'type': 'range',
                'min': '0',
                'max': '100',
                'value': '50'
            })
            .css({
                'width': '120px',
                'margin-right': '8px'
            })
            .appendTo(speedContainer);
        
        const speedValue = $('<span></span>')
            .text('50')
            .css({
                'min-width': '30px',
                'text-align': 'center'
            })
            .appendTo(speedContainer);
        
        const speedButton = $('<button></button>')
            .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
            .text('Set')
            .css({
                'margin-left': '8px',
                'min-width': '50px'
            })
            .appendTo(speedContainer);
        
        // Обработчики событий
        speedSlider.on('input', () => {
            speedValue.text(speedSlider.val());
        });
        
        speedButton.click(() => {
            this.robotController.executeCommand('set_speed', { 
                value: parseInt(speedSlider.val()) 
            });
        });
    }
    
    createDirectionSlider(container) {
        const directionContainer = $('<div></div>')
            .css({
                'margin-bottom': '16px',
                'display': 'flex',
                'align-items': 'center',
                'flex-wrap': 'wrap'
            })
            .appendTo(container);
        
        $('<label></label>')
            .text('Direction: ')
            .css({
                'margin-right': '8px',
                'min-width': '70px'
            })
            .appendTo(directionContainer);
        
        const directionSlider = $('<input></input>')
            .attr({
                'type': 'range',
                'min': '-180',
                'max': '180',
                'value': '0'
            })
            .css({
                'width': '120px',
                'margin-right': '8px'
            })
            .appendTo(directionContainer);
        
        const directionValue = $('<span></span>')
            .text('0°')
            .css({
                'min-width': '40px',
                'text-align': 'center'
            })
            .appendTo(directionContainer);
        
        const directionButton = $('<button></button>')
            .addClass('mdl-button mdl-js-button mdl-button--raised mdl-button--colored')
            .text('Set')
            .css({
                'margin-left': '8px',
                'min-width': '50px'
            })
            .appendTo(directionContainer);
        
        // Обработчики событий
        directionSlider.on('input', () => {
            directionValue.text(directionSlider.val() + '°');
        });
        
        directionButton.click(() => {
            this.robotController.executeCommand('set_direction', { 
                value: parseInt(directionSlider.val()) 
            });
        });
    }
    
    update(data) {
        // Этот метод вызывается при получении данных
        // Для командной панели он не нужен, но может использоваться
        // для обновления статуса робота
        if (data && data.status) {
            console.log('Robot status update:', data);
        }
    }
    
    destroy() {
        // Удаляем карточку из сетки
        if (window.$grid) {
            window.$grid.masonry("remove", this.card);
            window.$grid.masonry("layout");
        }
        
        // Удаляем из подписок
        if (window.subscriptions && window.subscriptions[this.topicName]) {
            delete window.subscriptions[this.topicName];
            window.updateStoredSubscriptions();
        }
        
        // Удаляем DOM элемент
        this.card.remove();
    }
}

// Регистрируем viewer в системе
Viewer.registerViewer('robot_control', RobotControlViewer);

// Экспортируем класс
window.RobotControlViewer = RobotControlViewer;
