const { createModel } = require('./pgModel');

const ConsentRecord = createModel('consent_records');

module.exports = ConsentRecord;
