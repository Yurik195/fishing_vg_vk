// State Machine для управления состояниями рыбалки
class FishingStateMachine {
    constructor() {
        this.currentState = FISHING_CONFIG.STATES.IDLE;
        this.previousState = null;
        this.stateTime = 0;
        this.listeners = new Map();
        this.stateData = {};
    }
    
    // Переход в новое состояние
    transition(newState, data = {}) {
        if (this.currentState === newState) return;
        
        this.previousState = this.currentState;
        this.currentState = newState;
        this.stateTime = 0;
        this.stateData = data;
        
        this.emit('stateChange', {
            from: this.previousState,
            to: newState,
            data: data
        });
        
        this.emit(`enter:${newState}`, data);
        this.emit(`exit:${this.previousState}`, data);
    }
    
    // Обновление времени в состоянии
    update(dt) {
        this.stateTime += dt;
        this.emit(`update:${this.currentState}`, {
            dt,
            stateTime: this.stateTime,
            data: this.stateData
        });
    }
    
    // Проверка текущего состояния
    is(state) {
        return this.currentState === state;
    }
    
    // Проверка нескольких состояний
    isAny(...states) {
        return states.includes(this.currentState);
    }
    
    // Получить время в текущем состоянии
    getStateTime() {
        return this.stateTime;
    }
    
    // Подписка на события
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    // Отписка от событий
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) callbacks.splice(index, 1);
        }
    }
    
    // Вызов события
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
    
    // Сброс в начальное состояние
    reset() {
        this.transition(FISHING_CONFIG.STATES.IDLE);
        this.stateData = {};
    }
}
