const { createModel } = require('./pgModel');

const TelecomIntegration = createModel('telecom_integrations');

module.exports = TelecomIntegration;
