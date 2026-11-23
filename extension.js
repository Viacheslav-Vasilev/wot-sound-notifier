const vscode = require('vscode');
const path = require('path');
const { SoundManager } = require('./soundManager');

const COMPILER_COMMANDS = [
    'g++',
    'gcc',
    'clang++',
    'clang',
    'make',
    'cmake',
    'javac',
    'rustc',
    'cargo',
    'go',
    'tsc',
    'python',
    'python3'
];

/**
 * точка входа расширения Вызывается VS Code при активации плагина
 * @param {vscode.ExtensionContext} context контекст жизненного цикла расширения
 */
function activate(context) {
    const soundsDir = path.join(context.extensionPath, 'sounds');
    const soundManager = new SoundManager(soundsDir);

    soundManager.play('startup');

    const toggleCommand = vscode.commands.registerCommand('wot-sound-notifier.toggle', () => {
        const isEnabled = soundManager.toggle();
        let status = 'выключена';
        if (isEnabled) {
            status = 'включена';
        }
        vscode.window.showInformationMessage(`WoT Sound Notifier: озвучка ${status}`);
    });

    const terminalListener = vscode.window.onDidEndTerminalShellExecution((event) => {
        const commandLine = event.execution.commandLine.value.trim();

        if (commandLine) {
            const firstWord = commandLine.split(/\s+/)[0];
            const executable = path.basename(firstWord);
            if (!COMPILER_COMMANDS.includes(executable)) {
                return;
            }
        }

        if (event.exitCode === 0) {
            soundManager.play('success');
        } else if (event.exitCode !== undefined) {
            soundManager.play('error');
        }
    });

    context.subscriptions.push(toggleCommand, terminalListener);
}

/**
 * вызывается VS Code при деактивации расширения
 */
function deactivate() {}

module.exports = {
    activate,
    deactivate
};