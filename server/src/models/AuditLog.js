const { createModel } = require('./pgModel');

const AuditLog = createModel('audit_logs');

module.exports = AuditLog;
