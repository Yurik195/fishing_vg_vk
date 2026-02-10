// Менеджер ресурсов - унифицированная загрузка изображений
class AssetManager {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        
        // Пути к папкам с ресурсами (пустые строки = корень проекта)
        this.paths = {
            fish: '',
            gear: '',
            bait: ''
        };
        
        // Форматы файлов
        this.formats = {
            fish: 'png',
            gear: 'png',
            bait: 'png'
        };
        
        // Интеграция с облаком
        this.cloudLoader = null;
        this.useCloud = false;
        
        // Загружаем UI изображения при инициализации
        this.loadUIImages();
    }
    
    // Инициализация загрузки из облака
    initCloudLoader(bucketUrl) {
        this.cloudLoader = new CloudAssetLoader(bucketUrl);
        this.useCloud = true;
        console.log('☁️ Облачная загрузка активирована');
    }
    
    // Проверка, нужно ли загружать из облака
    shouldLoadFromCloud(path) {
        if (!this.useCloud || !this.cloudLoader) return false;
        
        // Список файлов, которые загружаются из облака
        const cloudPaths = [
            'fish_', // Все рыбы
            'm', // Все монстры (m1.png - m20.png)
            'backgrounds/', // Фоны локаций
            'kart/', // Иконки локаций
            'sounds/' // Звуки
        ];
        
        return cloudPaths.some(prefix => path.includes(prefix) || path.startsWith(prefix));
    }
    
    // Загрузить UI изображения
    loadUIImages() {
        // Список UI изображений для загрузки (только локальные файлы)
        const uiImages = [
            'rmk.png',
            'magaz.png',
            'inv.png',
            'inv_rib.png',
            'kart.png',
            'profl.png',
            'nastr.png',
            'reit.png',
            'rinok.png',
            'sadok.png',
            'uipan.png',
            'zad.png',
            'mark.png',
            'one_marka.png',
            'go.png',
            'enc.png',
            'dom.png',
            'traf.png',
            'tini.png',
            'podr.png',
            'katush.png',
            'ramk.png',
            'sereb.png',
            'nag.png',
            'zak.png',
            'kladovk.jpg',
            'obl.png',
            'trafe.png',
            'naz.png',
            'coin.png',
            'sadk.png'
        ];
        
        // Добавляем спрайты поплавков (18 уровней)
        for (let i = 1; i <= 18; i++) {
            const floatSprite = `float_${String(i).padStart(2, '0')}.png`;
            uiImages.push(floatSprite);
        }
        
        // Добавляем спрайты лесок (18 уровней)
        for (let i = 1; i <= 18; i++) {
            const lineSprite = `l_${i}.png`;
            uiImages.push(lineSprite);
        }
        
        // Добавляем спрайты крючков (18 уровней)
        for (let i = 1; i <= 18; i++) {
            const hookSprite = `k_${i}.png`;
            uiImages.push(hookSprite);
        }
        
        // Добавляем спрайты удочек (18 уровней)
        for (let i = 1; i <= 18; i++) {
            const rodSprite = `u${i}.png`;
            uiImages.push(rodSprite);
        }
        
        // Добавляем спрайты катушек (18 уровней)
        for (let i = 1; i <= 18; i++) {
            const reelSprite = `h${i}.png`;
            uiImages.push(reelSprite);
        }
        
        // Добавляем спрайты наживок (21 вид) - локально
        for (let i = 1; i <= 21; i++) {
            const baitSprite = `n${i}.png`;
            uiImages.push(baitSprite);
        }
        
        // Добавляем спрайты предметов (8 видов) - локально
        for (let i = 1; i <= 8; i++) {
            const junkSprite = `g${i}.png`;
            uiImages.push(junkSprite);
        }
        
        // Добавляем спрайты премиум бонусов (17 видов)
        for (let i = 1; i <= 17; i++) {
            const premiumSprite = `p${i}.png`;
            uiImages.push(premiumSprite);
        }
        
        // Добавляем спрайты наборов снастей (3 вида)
        uiImages.push('prem1.png');
        uiImages.push('prem2.png');
        uiImages.push('prem3.png');
        
        // Монстры и рыбы теперь загружаются из облака по требованию
        // Не загружаем их при инициализации
        
        // Загружаем каждое изображение
        uiImages.forEach(imageName => {
            this.loadImage(imageName);
        });
    }
    
    // Получить путь к изображению рыбы
    getFishImagePath(fishId) {
        const id = String(fishId).padStart(3, '0');
        const filename = `fish_${id}.${this.formats.fish}`;
        
        // Если используется облако, возвращаем путь в облаке
        if (this.useCloud) {
            return `fish/${filename}`;
        }
        
        return `${this.paths.fish}${filename}`;
    }
    
    // Получить путь к изображению монстра
    getMonsterImagePath(monsterId) {
        const filename = `m${monsterId}.png`;
        
        // Если используется облако, возвращаем путь в облаке
        if (this.useCloud) {
            return `monsters/${filename}`;
        }
        
        return filename;
    }
    
    // Получить путь к изображению снасти
    getGearImagePath(gearType, tier) {
        const tierStr = String(tier).padStart(2, '0');
        return `${this.paths.gear}${gearType}_${tierStr}.${this.formats.gear}`;
    }
    
    // Получить путь к изображению наживки
    getBaitImagePath(baitId) {
        // Используем прямые спрайты n1.png - n21.png
        return `n${baitId}.png`;
    }
    
    // Получить путь к изображению предмета
    getJunkImagePath(junkId) {
        // Используем прямые спрайты g1.png - g8.png (локально)
        return `g${junkId}.png`;
    }
    
    // Получить путь к изображению премиум бонуса
    getPremiumImagePath(premiumId) {
        // Используем прямые спрайты p1.png - p17.png (локально)
        return `p${premiumId}.png`;
    }
    
    // Загрузить изображение
    loadImage(path) {
        // Если уже загружено - возвращаем
        if (this.images.has(path)) {
            return Promise.resolve(this.images.get(path));
        }
        
        // Если загружается - возвращаем промис
        if (this.loadingPromises.has(path)) {
            return this.loadingPromises.get(path);
        }
        
        // Проверяем, нужно ли загружать из облака
        if (this.shouldLoadFromCloud(path)) {
            const promise = this.cloudLoader.loadImage(path)
                .then(img => {
                    this.images.set(path, img);
                    this.loadingPromises.delete(path);
                    return img;
                })
                .catch(error => {
                    console.error(`Ошибка загрузки из облака: ${path}`, error);
                    this.loadingPromises.delete(path);
                    return null;
                });
            
            this.loadingPromises.set(path, promise);
            return promise;
        }
        
        // Создаем новый промис загрузки (локально)
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(path, img);
                this.loadingPromises.delete(path);
                resolve(img);
            };
            
            img.onerror = () => {
                this.loadingPromises.delete(path);
                // Возвращаем null если изображение не загрузилось
                resolve(null);
            };
            
            img.src = path;
        });
        
        this.loadingPromises.set(path, promise);
        return promise;
    }
    
    // Загрузить изображение рыбы
    async loadFishImage(fishId) {
        const path = this.getFishImagePath(fishId);
        return await this.loadImage(path);
    }
    
    // Загрузить изображение снасти
    async loadGearImage(gearType, tier) {
        const path = this.getGearImagePath(gearType, tier);
        return await this.loadImage(path);
    }
    
    // Загрузить изображение наживки
    async loadBaitImage(baitId) {
        const path = this.getBaitImagePath(baitId);
        return await this.loadImage(path);
    }
    
    // Загрузить изображение предмета
    async loadJunkImage(junkId) {
        const path = this.getJunkImagePath(junkId);
        return await this.loadImage(path);
    }
    
    // Загрузить изображение премиум бонуса
    async loadPremiumImage(premiumId) {
        const path = this.getPremiumImagePath(premiumId);
        return await this.loadImage(path);
    }
    
    // Загрузить изображение монстра
    async loadMonsterImage(monsterId) {
        const path = this.getMonsterImagePath(monsterId);
        return await this.loadImage(path);
    }
    
    // Загрузить фон локации из облака
    async loadLocationBackground(locationImage) {
        if (!this.useCloud) {
            // Локальная загрузка
            return await this.loadImage(locationImage);
        }
        
        // Загрузка из облака
        const path = `backgrounds/${locationImage}`;
        return await this.loadImage(path);
    }
    
    // Загрузить иконку локации из облака
    async loadLocationIcon(iconNumber) {
        if (!this.useCloud) {
            // Локальная загрузка
            return await this.loadImage(`${iconNumber}.png`);
        }
        
        // Загрузка из облака
        const path = `kart/${iconNumber}.png`;
        return await this.loadImage(path);
    }
    
    // Загрузить все иконки локаций (для карты)
    async loadAllLocationIcons(count = 20) {
        const promises = [];
        for (let i = 1; i <= count; i++) {
            promises.push(this.loadLocationIcon(i));
        }
        return await Promise.all(promises);
    }
    
    // Предзагрузка рыб для конкретной локации
    async preloadLocationFish(fishIds, onProgress = null) {
        if (!fishIds || fishIds.length === 0) return;
        
        console.log(`🐟 Предзагрузка ${fishIds.length} рыб для локации`);
        
        const paths = fishIds.map(id => this.getFishImagePath(id));
        
        if (this.useCloud && this.cloudLoader) {
            await this.cloudLoader.loadImageBatch(paths, onProgress);
        } else {
            // Локальная загрузка
            let loaded = 0;
            for (const fishId of fishIds) {
                await this.loadFishImage(fishId);
                loaded++;
                if (onProgress) {
                    onProgress(Math.round((loaded / fishIds.length) * 100));
                }
            }
        }
    }
    
    // Предзагрузка монстров для конкретной локации
    async preloadLocationMonsters(monsterIds, onProgress = null) {
        if (!monsterIds || monsterIds.length === 0) return;
        
        console.log(`👹 Предзагрузка ${monsterIds.length} монстров для локации`);
        
        const paths = monsterIds.map(id => this.getMonsterImagePath(id));
        
        if (this.useCloud && this.cloudLoader) {
            await this.cloudLoader.loadImageBatch(paths, onProgress);
        } else {
            // Локальная загрузка
            let loaded = 0;
            for (const monsterId of monsterIds) {
                await this.loadMonsterImage(monsterId);
                loaded++;
                if (onProgress) {
                    onProgress(Math.round((loaded / monsterIds.length) * 100));
                }
            }
        }
    }
    
    // Получить изображение (синхронно, если уже загружено)
    getImage(path) {
        return this.images.get(path) || null;
    }
    
    // Получить изображение рыбы (синхронно)
    getFishImage(fishId) {
        const path = this.getFishImagePath(fishId);
        return this.getImage(path);
    }
    
    // Получить изображение снасти (синхронно)
    getGearImage(gearType, tier) {
        const path = this.getGearImagePath(gearType, tier);
        return this.getImage(path);
    }
    
    // Получить изображение наживки (синхронно)
    getBaitImage(baitId) {
        const path = this.getBaitImagePath(baitId);
        return this.getImage(path);
    }
    
    // Получить изображение предмета (синхронно)
    getJunkImage(junkId) {
        const path = this.getJunkImagePath(junkId);
        return this.getImage(path);
    }
    
    // Получить изображение премиум бонуса (синхронно)
    getPremiumImage(premiumId) {
        const path = this.getPremiumImagePath(premiumId);
        return this.getImage(path);
    }
    
    // Получить изображение монстра (синхронно)
    getMonsterImage(monsterId) {
        const path = this.getMonsterImagePath(monsterId);
        return this.getImage(path);
    }
    
    // Отрисовать изображение или fallback (emoji)
    drawImageOrEmoji(ctx, type, id, x, y, size, emoji) {
        let img = null;
        
        switch(type) {
            case 'fish':
                img = this.getFishImage(id);
                break;
            case 'bait':
                img = this.getBaitImage(id);
                break;
            case 'gear':
                // id здесь это {type, tier}
                img = this.getGearImage(id.type, id.tier);
                break;
            case 'junk':
                img = this.getJunkImage(id);
                break;
            case 'premium':
                img = this.getPremiumImage(id);
                break;
            case 'monster':
                img = this.getMonsterImage(id);
                break;
        }
        
        if (img) {
            // Рисуем изображение
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.drawImage(img, x - size/2, y - size/2, size, size);
            ctx.restore();
        } else {
            // Рисуем emoji как fallback
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(emoji, x, y);
            ctx.restore();
        }
    }
    
    // Предзагрузка всех изображений рыб
    async preloadAllFish(fishDatabase) {
        const promises = fishDatabase.map(fish => this.loadFishImage(fish.id));
        await Promise.all(promises);
    }
    
    // Предзагрузка всех изображений наживок
    async preloadAllBaits(baitsDatabase) {
        const promises = baitsDatabase.map(bait => this.loadBaitImage(bait.id));
        await Promise.all(promises);
    }
    
    // Предзагрузка всех изображений снастей
    async preloadAllGear(gearDatabases) {
        const promises = [];
        
        Object.keys(gearDatabases).forEach(type => {
            gearDatabases[type].forEach(gear => {
                promises.push(this.loadGearImage(type, gear.tier));
            });
        });
        
        await Promise.all(promises);
    }
    
    // Отрисовать спрайт монеты вместо эмодзи
    drawCoinIcon(ctx, x, y, size = 20) {
        const coinImg = this.getImage('coin.png');
        
        if (coinImg) {
            // Рисуем спрайт монеты с максимальным качеством
            ctx.save();
            
            // Включаем высококачественное сглаживание
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Увеличиваем размер на 15% для лучшей четкости
            const enhancedSize = size * 1.15;
            
            // Рисуем с целыми координатами для четкости
            const drawX = Math.round(x - enhancedSize/2);
            const drawY = Math.round(y - enhancedSize/2);
            const drawSize = Math.round(enhancedSize);
            
            ctx.drawImage(coinImg, drawX, drawY, drawSize, drawSize);
            ctx.restore();
        } else {
            // Fallback на эмодзи если спрайт не загружен
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💰', x, y);
            ctx.restore();
        }
    }
    
    // Отрисовать спрайт гема вместо эмодзи
    drawGemIcon(ctx, x, y, size = 20) {
        const gemImg = this.getImage('one_marka.png');
        
        if (gemImg) {
            // Рисуем спрайт гема с максимальным качеством
            ctx.save();
            
            // Включаем высококачественное сглаживание
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Увеличиваем размер на 15% для лучшей четкости
            const enhancedSize = size * 1.15;
            
            // Рисуем с целыми координатами для четкости
            const drawX = Math.round(x - enhancedSize/2);
            const drawY = Math.round(y - enhancedSize/2);
            const drawSize = Math.round(enhancedSize);
            
            // Добавляем небольшую тень для глубины
            ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 1;
            
            ctx.drawImage(gemImg, drawX, drawY, drawSize, drawSize);
            ctx.restore();
        } else {
            // Fallback на эмодзи если спрайт не загружен
            ctx.save();
            ctx.font = `${size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💎', x, y);
            ctx.restore();
        }
    }
    
    // Отрисовать текст с иконкой монеты (заменяет эмодзи 💰 на спрайт)
    drawTextWithCoinIcon(ctx, text, x, y, fontSize = 20, coinSize = null) {
        // Если размер монеты не указан, используем размер шрифта
        if (!coinSize) {
            coinSize = fontSize;
        }
        
        // Разбиваем текст на части по эмодзи монеты
        const parts = text.split('💰');
        
        if (parts.length === 1) {
            // Нет эмодзи монеты, просто рисуем текст
            ctx.fillText(text, x, y);
            return;
        }
        
        // Сохраняем текущие настройки
        const originalTextAlign = ctx.textAlign;
        const originalTextBaseline = ctx.textBaseline;
        
        // Временно устанавливаем left align для точного позиционирования
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        let currentX = x;
        
        // Корректируем начальную позицию в зависимости от выравнивания
        if (originalTextAlign === 'center') {
            const totalWidth = ctx.measureText(text.replace(/💰/g, '')).width + (parts.length - 1) * coinSize * 0.9;
            currentX = x - totalWidth / 2;
        } else if (originalTextAlign === 'right') {
            const totalWidth = ctx.measureText(text.replace(/💰/g, '')).width + (parts.length - 1) * coinSize * 0.9;
            currentX = x - totalWidth;
        }
        
        // Рисуем части текста и иконки монет
        for (let i = 0; i < parts.length; i++) {
            if (parts[i]) {
                ctx.fillText(parts[i], currentX, y);
                currentX += ctx.measureText(parts[i]).width;
            }
            
            // Рисуем иконку монеты между частями (кроме последней)
            if (i < parts.length - 1) {
                // Добавляем небольшой отступ перед иконкой
                currentX += 2;
                this.drawCoinIcon(ctx, currentX + coinSize/2, y, coinSize * 0.9);
                currentX += coinSize * 0.9 + 2;
            }
        }
        
        // Восстанавливаем настройки
        ctx.textAlign = originalTextAlign;
        ctx.textBaseline = originalTextBaseline;
    }
    
    // Отрисовать текст с иконкой гема (заменяет эмодзи 💎 на спрайт)
    drawTextWithGemIcon(ctx, text, x, y, fontSize = 20, gemSize = null) {
        // Если размер гема не указан, используем размер шрифта
        if (!gemSize) {
            gemSize = fontSize;
        }
        
        // Разбиваем текст на части по эмодзи гема
        const parts = text.split('💎');
        
        if (parts.length === 1) {
            // Нет эмодзи гема, просто рисуем текст
            ctx.fillText(text, x, y);
            return;
        }
        
        // Сохраняем текущие настройки
        const originalTextAlign = ctx.textAlign;
        const originalTextBaseline = ctx.textBaseline;
        
        // Временно устанавливаем left align для точного позиционирования
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        let currentX = x;
        
        // Корректируем начальную позицию в зависимости от выравнивания
        if (originalTextAlign === 'center') {
            const totalWidth = ctx.measureText(text.replace(/💎/g, '')).width + (parts.length - 1) * gemSize * 0.9;
            currentX = x - totalWidth / 2;
        } else if (originalTextAlign === 'right') {
            const totalWidth = ctx.measureText(text.replace(/💎/g, '')).width + (parts.length - 1) * gemSize * 0.9;
            currentX = x - totalWidth;
        }
        
        // Рисуем части текста и иконки гемов
        for (let i = 0; i < parts.length; i++) {
            if (parts[i]) {
                ctx.fillText(parts[i], currentX, y);
                currentX += ctx.measureText(parts[i]).width;
            }
            
            // Рисуем иконку гема между частями (кроме последней)
            if (i < parts.length - 1) {
                // Добавляем небольшой отступ перед иконкой
                currentX += 2;
                this.drawGemIcon(ctx, currentX + gemSize/2, y, gemSize * 0.9);
                currentX += gemSize * 0.9 + 2;
            }
        }
        
        // Восстанавливаем настройки
        ctx.textAlign = originalTextAlign;
        ctx.textBaseline = originalTextBaseline;
    }
}

// Глобальный экземпляр
const assetManager = new AssetManager();

// Делаем доступным глобально
if (typeof window !== 'undefined') {
    window.assetManager = assetManager;
}
