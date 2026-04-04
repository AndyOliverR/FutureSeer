/** Browser bundle shim — server uses real firebase-admin. Never called on client (dead branch). */
module.exports = {
  getApps: () => [],
  initializeApp: function initializeApp() {
    return { name: '[default]' };
  },
  cert: function cert() {
    return {};
  },
};
