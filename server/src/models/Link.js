const { createModel } = require('./pgModel');

const linkMethods = {
  isLinkActive() {
    if (this.status !== 'ACTIVE') return false;
    if (this.expirationDate && new Date(this.expirationDate) < new Date()) {
      return false;
    }
    return true;
  },
};

const Link = createModel('links', linkMethods);

module.exports = Link;
