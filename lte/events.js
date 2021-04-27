import EventEmitter from 'events';

const MyEmitter = new EventEmitter();

class CustomEmitter {
    constructor(emitter) {
        this._emitter = emitter;
    }

    on(eventName, ...rest) {
        this._emitter.on(eventName, ...rest);
        console.debug(`listen [${eventName}] exist listener [${this._emitter.listenerCount(eventName)}]`);
    }

    emit(eventName, ...rest) {
        this._emitter.emit(eventName, ...rest);
        console.debug(`emit [${eventName}] exist listener [${this._emitter.listenerCount(eventName)}] `, ...rest);
    }
}

export const Emitter = new CustomEmitter(MyEmitter);

export const EVENTS = {
    CellInfoChanged: 'cellInfoChanged'
};