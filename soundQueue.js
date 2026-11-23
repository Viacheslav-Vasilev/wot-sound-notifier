const { execFile } = require('child_process');

/**
 * очередь воспроизведения аудиофайлов FIFO
 * обеспечивает последовательное проигрывание звуков без наложения
 */
class SoundQueue {
    /**
     * создаёт экземпляр очереди воспроизведения
     * @param {number} [maxSize=3] Макс количество звуков в очереди
     */
    constructor(maxSize = 3) {
        this.queue = [];
        this.maxSize = maxSize;
        this.isPlaying = false;
    }

    /**
     * добавляет аудиофайл в очередь и запускает воспроизведение если плеер свободен.
     * @param {string} filePath Полный путь к аудиофайлу
     */
    enqueue(filePath) {
        if (this.queue.length >= this.maxSize) {
            return;
        }
        this.queue.push(filePath);
        if (!this.isPlaying) {
            this.processNext();
        }
    }

    /**
     * извлекает следующий файл из очереди и воспроизводит его через ffplay
     */
    processNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const nextFile = this.queue.shift();

        execFile('ffplay', ['-nodisp', '-autoexit', '-loglevel', 'quiet', nextFile], () => {
            this.processNext();
        });
    }

    /**
     * очищает очередь ожидающих воспроизведения звуко
     */
    clear() {
        this.queue = [];
    }
}

module.exports = { SoundQueue };