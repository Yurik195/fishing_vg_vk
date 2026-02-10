class AudioManager {
    constructor() {
        this.audioContext = null;
        this.soundBuffers = new Map();
        this.musicBuffer = null;
        this.ambientBuffer = null;
        
        // Активные источники звука
        this.activeSources = new Map();
        this.musicSource = null;
        this.ambientSource = null;
        
        // Gain nodes для управления громкостью
        this.masterGain = null;
        this.soundGain = null;
        this.musicGain = null;
        this.ambientGain = null;
        
        this.soundEnabled = true;
        this.musicEnabled = true;
        this.soundVolume = 1.0;
        this.musicVolume = 0.15;
        this.ambientVolume = 0.3;
        this.initialized = false;
        
        // Состояние для восстановления после рекламы/потери фокуса
        this.wasMusicPlaying = false;
        this.wasAmbientPlaying = false;
        this.isMuted = false;
        
        // Атмосферные звуки
        this.atmosphereTimers = new Map();
        this.atmosphereEnabled = false;
        
        // Зацикленные звуки
        this.loopingSources = new Map();
        
        // Музыка
        this.musicStartTime = 0;
        this.musicPauseTime = 0;
        
        this.loadSettings();
        this.setupVisibilityHandlers();
    }
    
    async init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Создаем gain nodes
            this.masterGain = this.audioContext.createGain();
            this.soundGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.ambientGain = this.audioContext.createGain();
            
            // Подключаем gain nodes
            this.soundGain.connect(this.masterGain);
            this.musicGain.connect(this.masterGain);
            this.ambientGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Устанавливаем начальные значения громкости
            this.soundGain.gain.value = this.soundVolume;
            this.musicGain.gain.value = this.musicVolume;
            this.ambientGain.gain.value = this.ambientVolume;
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.initialized = true;
        } catch (e) {
            console.error('Audio initialization failed:', e);
        }
    }
    
    async loadSound(name, url) {
        if (!this.initialized) await this.init();
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.soundBuffers.set(name, audioBuffer);
        } catch (e) {
            console.error(`Failed to load sound ${name}:`, e);
        }
    }
    
    playSound(name, volume = null) {
        if (!this.soundEnabled || this.isMuted || !this.initialized) return;
        
        const buffer = this.soundBuffers.get(name);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume !== null ? volume : 1.0;
            
            source.connect(gainNode);
            gainNode.connect(this.soundGain);
            
            source.start(0);
            
            // Очищаем источник после завершения
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };
        }
    }
    
    // Воспроизведение звука клика по UI элементам
    playClickSound() {
        this.playSound('klik', 0.5); // Громкость 50% от настройки звуков
    }
    
    // Воспроизведение звука с плавным появлением (fade in)
    playSoundWithFade(name, targetVolume = null, fadeDuration = 1.5) {
        if (!this.soundEnabled || this.isMuted || !this.initialized) return;
        
        const buffer = this.soundBuffers.get(name);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            const gainNode = this.audioContext.createGain();
            const finalVolume = targetVolume !== null ? targetVolume : 1.0;
            
            // Начинаем с нулевой громкости и плавно увеличиваем
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(finalVolume, this.audioContext.currentTime + fadeDuration);
            
            source.connect(gainNode);
            gainNode.connect(this.ambientGain);
            
            source.start(0);
            
            // Очищаем источник после завершения
            source.onended = () => {
                source.disconnect();
                gainNode.disconnect();
            };
        }
    }
    
    // Воспроизведение случайного звука из списка
    playRandomSound(names) {
        if (!this.soundEnabled || this.isMuted || names.length === 0) return;
        const randomName = names[Math.floor(Math.random() * names.length)];
        this.playSound(randomName);
    }
    
    // Запуск зацикленного звука
    startLoopingSound(name, volume = null) {
        if (!this.soundEnabled || this.isMuted || !this.initialized) return;
        
        // Проверяем не играет ли уже этот звук
        if (this.loopingSources.has(name)) return;
        
        const buffer = this.soundBuffers.get(name);
        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume !== null ? volume : 1.0;
            
            source.connect(gainNode);
            gainNode.connect(this.soundGain);
            
            source.start(0);
            
            this.loopingSources.set(name, { source, gainNode });
        }
    }
    
    // Остановка зацикленного звука
    stopLoopingSound(name) {
        const loopData = this.loopingSources.get(name);
        if (loopData) {
            loopData.source.stop();
            loopData.source.disconnect();
            loopData.gainNode.disconnect();
            this.loopingSources.delete(name);
        }
    }
    
    // Остановка всех зацикленных звуков
    stopAllLoopingSounds() {
        this.loopingSources.forEach((loopData) => {
            loopData.source.stop();
            loopData.source.disconnect();
            loopData.gainNode.disconnect();
        });
        this.loopingSources.clear();
    }
    
    async playMusic(url = null, loop = true) {
        if (!this.musicEnabled || this.isMuted || this.musicVolume === 0 || !this.initialized) return;
        
        // Если URL не передан, возобновляем уже загруженную музыку
        if (!url && this.musicBuffer) {
            if (!this.musicSource) {
                this.musicSource = this.audioContext.createBufferSource();
                this.musicSource.buffer = this.musicBuffer;
                this.musicSource.loop = true;
                this.musicSource.connect(this.musicGain);
                
                const offset = this.musicPauseTime || 0;
                this.musicSource.start(0, offset);
                this.musicStartTime = this.audioContext.currentTime - offset;
            }
            return;
        }
        
        // Если URL передан, загружаем новую музыку
        if (url) {
            this.stopMusic();
            
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                this.musicBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.musicSource = this.audioContext.createBufferSource();
                this.musicSource.buffer = this.musicBuffer;
                this.musicSource.loop = loop;
                this.musicSource.connect(this.musicGain);
                
                this.musicSource.start(0);
                this.musicStartTime = this.audioContext.currentTime;
                this.musicPauseTime = 0;
            } catch (e) {
                console.error('Failed to load music:', e);
            }
        }
    }
    
    stopMusic() {
        if (this.musicSource) {
            try {
                this.musicSource.stop();
                this.musicSource.disconnect();
            } catch (e) {
                // Источник уже остановлен
            }
            this.musicSource = null;
            this.musicPauseTime = 0;
        }
    }
    
    pauseMusic() {
        if (this.musicSource) {
            this.musicPauseTime = this.audioContext.currentTime - this.musicStartTime;
            try {
                this.musicSource.stop();
                this.musicSource.disconnect();
            } catch (e) {
                // Источник уже остановлен
            }
            this.musicSource = null;
        }
    }
    
    async playAmbient(url, loop = true) {
        if (this.ambientVolume === 0 || this.isMuted || !this.initialized) return;
        
        this.stopAmbient();
        
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            this.ambientBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            this.ambientSource = this.audioContext.createBufferSource();
            this.ambientSource.buffer = this.ambientBuffer;
            this.ambientSource.loop = loop;
            this.ambientSource.connect(this.ambientGain);
            
            this.ambientSource.start(0);
        } catch (e) {
            console.error('Failed to load ambient:', e);
        }
    }
    
    stopAmbient() {
        if (this.ambientSource) {
            try {
                this.ambientSource.stop();
                this.ambientSource.disconnect();
            } catch (e) {
                // Источник уже остановлен
            }
            this.ambientSource = null;
        }
    }
    
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        this.saveSettings();
    }
    
    setMusicEnabled(enabled) {
        this.musicEnabled = enabled;
        if (!enabled) {
            this.pauseMusic();
        } else if (enabled && this.musicBuffer) {
            this.playMusic();
        }
        this.saveSettings();
    }
    
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        if (this.soundVolume <= 0.01) {
            this.soundVolume = 0;
        }
        if (this.soundGain) {
            this.soundGain.gain.value = this.soundVolume;
        }
        this.saveSettings();
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicVolume <= 0.01) {
            this.musicVolume = 0;
            this.pauseMusic();
        } else {
            if (this.musicGain) {
                this.musicGain.gain.value = this.musicVolume;
            }
            if (!this.musicSource && this.musicEnabled && !this.isMuted && this.musicBuffer) {
                this.playMusic();
            }
        }
        this.saveSettings();
    }
    
    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
        if (this.ambientVolume <= 0.01) {
            this.ambientVolume = 0;
            this.stopAmbient();
            this.stopAtmosphere();
        } else {
            if (this.ambientGain) {
                this.ambientGain.gain.value = this.ambientVolume;
            }
        }
        this.saveSettings();
    }
    
    // Заглушка звука (для рекламы)
    muteAll() {
        this.isMuted = true;
        
        // Запоминаем состояние
        this.wasMusicPlaying = this.musicSource !== null;
        this.wasAmbientPlaying = this.ambientSource !== null;
        
        // Останавливаем все звуки
        this.pauseMusic();
        this.stopAmbient();
        this.stopAtmosphere();
        this.stopAllLoopingSounds();
    }
    
    // Восстановление звука
    unmuteAll() {
        this.isMuted = false;
        
        // Восстанавливаем музыку если она играла и включена в настройках
        if (this.wasMusicPlaying && this.musicEnabled && this.musicVolume > 0 && this.musicBuffer) {
            this.playMusic();
        }
        
        // Восстанавливаем атмосферу если она играла и включена
        if (this.wasAmbientPlaying && this.ambientVolume > 0 && this.ambientBuffer) {
            this.playAmbient(null);
        }
    }
    
    // Обработчики потери/получения фокуса
    setupVisibilityHandlers() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.muteAll();
            } else {
                this.unmuteAll();
            }
        });
        
        window.addEventListener('blur', () => {
            this.muteAll();
        });
        
        window.addEventListener('focus', () => {
            this.unmuteAll();
        });
    }
    
    saveSettings() {
        localStorage.setItem('audioSettings', JSON.stringify({
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            soundVolume: this.soundVolume,
            musicVolume: this.musicVolume,
            ambientVolume: this.ambientVolume
        }));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('audioSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.soundEnabled = settings.soundEnabled ?? true;
            this.musicEnabled = settings.musicEnabled ?? true;
            this.soundVolume = settings.soundVolume ?? 1.0;
            this.musicVolume = settings.musicVolume ?? 0.15; // Уменьшена громкость музыки
            this.ambientVolume = settings.ambientVolume ?? 0.3; // Уменьшена громкость атмосферы
            
            // Принудительно включаем звуки если они были отключены
            if (!this.soundEnabled) {
                this.soundEnabled = true;
                this.saveSettings();
            }
            
            // Если сохраненная громкость музыки больше 0.2, сбрасываем на новое значение
            if (this.musicVolume > 0.2) {
                this.musicVolume = 0.15;
                this.saveSettings();
            }
            
            // Если сохраненная громкость атмосферы больше 0.4, сбрасываем на новое значение
            if (this.ambientVolume > 0.4) {
                this.ambientVolume = 0.3;
                this.saveSettings();
            }
        }
    }
    
    // Запуск атмосферных звуков (ветер, дождь, птицы, лягушки, сверчки, сова)
    startAtmosphere(timeOfDay = 'day') {
        if (this.ambientVolume === 0 || this.isMuted) return;
        
        this.atmosphereEnabled = true;
        
        // Определяем какие звуки играть в зависимости от времени суток
        // Увеличены паузы между звуками для более ненавязчивой атмосферы
        const atmosphereConfig = {
            day: {
                sounds: ['bird1', 'bird2', 'bird3', 'veter1', 'veter2', 'veter3'],
                intervals: { bird: [15000, 35000], veter: [25000, 50000] } // Увеличены паузы
            },
            evening: {
                sounds: ['bird1', 'bird2', 'frog1', 'frog2', 'veter1', 'veter2', 'veter3'],
                intervals: { bird: [20000, 40000], frog: [18000, 35000], veter: [25000, 50000] } // Увеличены паузы
            },
            night: {
                sounds: ['frog1', 'frog2', 'sverch', 'sova', 'veter1', 'veter2', 'veter3'],
                intervals: { frog: [15000, 30000], sverch: [12000, 25000], sova: [30000, 60000], veter: [25000, 50000] } // Увеличены паузы
            }
        };
        
        const config = atmosphereConfig[timeOfDay] || atmosphereConfig.day;
        
        // Запускаем таймеры для каждого типа звуков
        Object.keys(config.intervals).forEach(type => {
            this.scheduleAtmosphereSound(type, config, timeOfDay);
        });
    }
    
    // Планирование следующего атмосферного звука
    scheduleAtmosphereSound(type, config, timeOfDay) {
        if (!this.atmosphereEnabled || this.isMuted) return;
        
        const [min, max] = config.intervals[type];
        const delay = min + Math.random() * (max - min);
        
        const timer = setTimeout(() => {
            if (!this.atmosphereEnabled || this.ambientVolume === 0 || this.isMuted) return;
            
            // Выбираем случайный звук данного типа
            const soundsOfType = config.sounds.filter(s => s.startsWith(type));
            if (soundsOfType.length > 0) {
                const sound = soundsOfType[Math.floor(Math.random() * soundsOfType.length)];
                // Используем плавное появление звука
                this.playSoundWithFade(sound, 1.0, 1.5);
            }
            
            // Планируем следующий звук
            this.scheduleAtmosphereSound(type, config, timeOfDay);
        }, delay);
        
        this.atmosphereTimers.set(type, timer);
    }
    
    // Остановка атмосферных звуков
    stopAtmosphere() {
        this.atmosphereEnabled = false;
        
        // Очищаем все таймеры
        this.atmosphereTimers.forEach(timer => clearTimeout(timer));
        this.atmosphereTimers.clear();
        
        // Атмосферные звуки воспроизводятся через playSoundWithFade
        // и автоматически очищаются после завершения
    }
    
    // Обновление атмосферы при смене времени суток
    updateAtmosphere(timeOfDay) {
        if (this.atmosphereEnabled) {
            this.stopAtmosphere();
            this.startAtmosphere(timeOfDay);
        }
    }
}
