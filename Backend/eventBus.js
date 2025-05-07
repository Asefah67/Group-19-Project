const EventEmitter = require('events')
class myEmitter extends EventEmitter {}

const eventBus = new myEmitter();

module.exports = eventBus