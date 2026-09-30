const { createModel } = require('./pgModel');

const Notification = createModel('notifications');

module.exports = Notification;
