const fs = require('fs');
const path = require('path');
const { SoundQueue } = require('./soundQueue');

const AUDIO_EXTENSIONS = ['.wav', '.mp3', '.ogg'];

/**
 * управляет загрузкой выбором и воспроизведением звуков по категориям
 */
class SoundManager {
    /**
     * инициализирует менеджер звуков и загружает файлы из подпапок
     * @param {string} soundsRootDir путь к корневой директории со звуками
     */
    constructor(soundsRootDir) {
        this.soundsRootDir = soundsRootDir;
        this.enabled = true;
        this.queue = new SoundQueue(3);

        this.sounds = {
            startup: this.loadCategory('startup'),
            success: this.loadCategory('success'),
            error: this.loadCategory('error')
        };

        this.lastPlayed = {
            startup: null,
            success: null,
            error: null
        };
    }

    /**
     * сканирует папку указанной категории и возвращает список путей к аудиофайлам
     * @param {string} category название категории (startup, success или error)
     * @returns {string[]} массив полных путей к найденным аудиофайлам
     */
    loadCategory(category) {
        const dirPath = path.join(this.soundsRootDir, category);
        if (!fs.existsSync(dirPath)) {
            return [];
        }

        return fs.readdirSync(dirPath)
            .filter((file) => AUDIO_EXTENSIONS.includes(path.extname(file).toLowerCase()))
            .map((file) => path.join(dirPath, file));
    }

    /**
     * выбирает случайный звук для события без повторения предыдущего и ставит его в очередь
     * @param {'startup' | 'success' | 'error'} eventType тип события IDE
     */
    play(eventType) {
        if (!this.enabled) {
            return;
        }

        const files = this.sounds[eventType];
        if (!files || files.length === 0) {
            return;
        }

        const lastFile = this.lastPlayed[eventType];
        let candidates = files;

        if (files.length > 1 && lastFile) {
            candidates = files.filter((file) => file !== lastFile);
        }

        const selected = candidates[Math.floor(Math.random() * candidates.length)];
        this.lastPlayed[eventType] = selected;
        this.queue.enqueue(selected);
    }

    /**
     * переключает состояние озвучки (включена/выключена) и очищает очередь при выключении
     * @returns {boolean} текущее состояние озвучки (true — включена)
     */
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.queue.clear();
        }
        return this.enabled;
    }
}

module.exports = { SoundManager };