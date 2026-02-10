// Система загрузки ассетов из Яндекс.Облака
class CloudAssetLoader {
    constructor(bucketUrl) {
        // Убеждаемся что URL заканчивается на /
        this.bucketUrl = bucketUrl.endsWith('/') ? bucketUrl : bucketUrl + '/';
        this.cache = new Map(); // Кэш загруженных файлов
        this.loading = new Map(); // Отслеживание процесса загрузки
        this.retryAttempts = 3; // Количество попыток загрузки
        this.retryDelay = 1000; // Задержка между попытками (мс)
        
        console.log('✅ CloudAssetLoader инициализирован:', this.bucketUrl);
    }

    /**
     * Загрузка изображения из облака
     * @param {string} path - Путь к файлу (например: 'fish/fish_001.png')
     * @param {function} onProgress - Колбэк прогресса (опционально)
     * @returns {Promise<HTMLImageElement>}
     */
    async loadImage(path, onProgress = null) {
        // Проверяем кэш
        if (this.cache.has(path)) {
            console.log(`📦 Из кэша: ${path}`);
            return this.cache.get(path);
        }

        // Проверяем, не загружается ли уже
        if (this.loading.has(path)) {
            console.log(`⏳ Ожидание загрузки: ${path}`);
            return this.loading.get(path);
        }

        // Создаем промис загрузки
        const loadPromise = this._loadImageWithRetry(path, onProgress);
        this.loading.set(path, loadPromise);

        try {
            const img = await loadPromise;
            this.cache.set(path, img);
            this.loading.delete(path);
            return img;
        } catch (error) {
            this.loading.delete(path);
            console.error(`❌ Ошибка загрузки: ${path}`, error);
            throw error;
        }
    }

    /**
     * Загрузка изображения с повторными попытками
     */
    async _loadImageWithRetry(path, onProgress, attempt = 1) {
        try {
            return await this._loadImageOnce(path, onProgress);
        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`⚠️ Попытка ${attempt}/${this.retryAttempts} не удалась для ${path}, повтор через ${this.retryDelay}мс...`);
                await this._sleep(this.retryDelay);
                return this._loadImageWithRetry(path, onProgress, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Одна попытка загрузки изображения
     */
    _loadImageOnce(path, onProgress) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                if (onProgress) onProgress(100);
                resolve(img);
            };
            
            img.onerror = () => {
                reject(new Error(`Failed to load image: ${path}`));
            };
            
            // Если есть колбэк прогресса, можно отслеживать (упрощенно)
            if (onProgress) {
                onProgress(50); // Начало загрузки
            }
            
            img.src = this.bucketUrl + path;
        });
    }

    /**
     * Загрузка аудио из облака
     * @param {string} path - Путь к файлу (например: 'sounds/music/muz.mp3')
     * @returns {Promise<HTMLAudioElement>}
     */
    async loadAudio(path) {
        // Проверяем кэш
        if (this.cache.has(path)) {
            console.log(`📦 Аудио из кэша: ${path}`);
            return this.cache.get(path);
        }

        // Проверяем, не загружается ли уже
        if (this.loading.has(path)) {
            console.log(`⏳ Ожидание загрузки аудио: ${path}`);
            return this.loading.get(path);
        }

        const loadPromise = this._loadAudioWithRetry(path);
        this.loading.set(path, loadPromise);

        try {
            const audio = await loadPromise;
            this.cache.set(path, audio);
            this.loading.delete(path);
            return audio;
        } catch (error) {
            this.loading.delete(path);
            console.error(`❌ Ошибка загрузки аудио: ${path}`, error);
            throw error;
        }
    }

    /**
     * Загрузка аудио с повторными попытками
     */
    async _loadAudioWithRetry(path, attempt = 1) {
        try {
            return await this._loadAudioOnce(path);
        } catch (error) {
            if (attempt < this.retryAttempts) {
                console.warn(`⚠️ Попытка ${attempt}/${this.retryAttempts} не удалась для аудио ${path}, повтор...`);
                await this._sleep(this.retryDelay);
                return this._loadAudioWithRetry(path, attempt + 1);
            }
            throw error;
        }
    }

    /**
     * Одна попытка загрузки аудио
     */
    _loadAudioOnce(path) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.crossOrigin = 'anonymous';
            
            audio.addEventListener('canplaythrough', () => {
                resolve(audio);
            }, { once: true });
            
            audio.addEventListener('error', () => {
                reject(new Error(`Failed to load audio: ${path}`));
            }, { once: true });
            
            audio.src = this.bucketUrl + path;
            audio.load();
        });
    }

    /**
     * Пакетная загрузка изображений
     * @param {string[]} paths - Массив путей к файлам
     * @param {function} onProgress - Колбэк прогресса (получает процент 0-100)
     * @returns {Promise<Map>} - Map с путями и загруженными изображениями
     */
    async loadImageBatch(paths, onProgress = null) {
        const results = new Map();
        let loaded = 0;
        const total = paths.length;

        console.log(`📦 Пакетная загрузка: ${total} файлов`);

        for (const path of paths) {
            try {
                const img = await this.loadImage(path);
                results.set(path, img);
                loaded++;
                
                if (onProgress) {
                    const progress = Math.round((loaded / total) * 100);
                    onProgress(progress);
                }
            } catch (error) {
                console.error(`❌ Не удалось загрузить ${path}:`, error);
                results.set(path, null);
            }
        }

        console.log(`✅ Пакетная загрузка завершена: ${loaded}/${total}`);
        return results;
    }

    /**
     * Предзагрузка файлов в фоне (без ожидания)
     * @param {string[]} paths - Массив путей к файлам
     */
    preloadImages(paths) {
        console.log(`🔄 Фоновая предзагрузка: ${paths.length} файлов`);
        paths.forEach(path => {
            this.loadImage(path).catch(err => {
                console.warn(`⚠️ Предзагрузка не удалась: ${path}`, err);
            });
        });
    }

    /**
     * Проверка, загружен ли файл
     */
    isLoaded(path) {
        return this.cache.has(path);
    }

    /**
     * Получение загруженного файла из кэша
     */
    getFromCache(path) {
        return this.cache.get(path);
    }

    /**
     * Очистка кэша (опционально)
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Кэш очищен');
    }

    /**
     * Задержка (для повторных попыток)
     */
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Получить размер кэша
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Получить статистику
     */
    getStats() {
        return {
            cached: this.cache.size,
            loading: this.loading.size
        };
    }
}
