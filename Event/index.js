/**
 * 事件：总控制类
 * @type {EventEmitter}
 */
const Event = require('events');
const eventEmitter = new Event.EventEmitter();
module.exports = eventEmitter
