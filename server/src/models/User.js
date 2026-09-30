const bcrypt = require('bcryptjs');
const { createModel } = require('./pgModel');

const userMethods = {
  async matchPassword(enteredPassword) {
    const hash = this.passwordHash || this.password_hash;
    if (!hash) return false;
    return await bcrypt.compare(enteredPassword, hash);
  },
  canCreateLinks() {
    return this.status === 'APPROVED';
  },
};

const User = createModel('users', userMethods);

module.exports = User;
