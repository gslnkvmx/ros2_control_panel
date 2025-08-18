/**
 * Тестовый файл для проверки работы RobotController
 * Этот файл можно подключить для отладки
 */

// Функция для тестирования RobotController
function testRobotController() {
    console.log('Testing RobotController...');
    
    // Проверяем, что RobotController доступен
    if (typeof RobotController === 'undefined') {
        console.error('RobotController not loaded');
        return;
    }
    
    console.log('RobotController class is available');
    
    // Проверяем, что транспорт доступен
    if (!currentTransport) {
        console.error('Transport not available');
        return;
    }
    
    console.log('Transport is available');
    
    // Проверяем, что контроллер робота инициализирован
    if (!robotController) {
        console.error('RobotController not initialized');
        return;
    }
    
    console.log('RobotController is initialized');
    console.log('Available commands:', Array.from(robotController.commands.keys()));
    
    // Тестируем создание UI
    try {
        robotController.createUI('controls-panel');
        console.log('UI creation test passed');
    } catch (error) {
        console.error('UI creation test failed:', error);
    }
    
    // Тестируем отправку команды (только если соединение установлено)
    if (currentTransport.isConnected()) {
        console.log('Testing command execution...');
        try {
            robotController.executeCommand('start');
            console.log('Command execution test passed');
        } catch (error) {
            console.error('Command execution test failed:', error);
        }
    } else {
        console.log('Transport not connected, skipping command test');
    }
}

// Функция для добавления тестовых команд
function addTestCommands() {
    if (!robotController) {
        console.error('RobotController not available');
        return;
    }
    
    // Добавляем тестовую команду
    robotController.registerCommand('test_command', {
        topic: '/test/topic',
        label: 'Test Command',
        buttonClass: 'mdl-button--raised mdl-button--accent',
        onSuccess: (data, response) => {
            console.log('Test command executed successfully');
            robotController.showNotification('Test command successful!', 'success');
        },
        onError: (data, response) => {
            console.log('Test command failed');
            robotController.showNotification('Test command failed!', 'error');
        }
    });
    
    console.log('Test commands added');
}

// Экспортируем функции для использования в консоли браузера
window.testRobotController = testRobotController;
window.addTestCommands = addTestCommands;

// Автоматически запускаем тест через 2 секунды после загрузки
setTimeout(() => {
    console.log('Auto-running RobotController test...');
    testRobotController();
}, 2000);
