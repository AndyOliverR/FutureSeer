/** Browser bundle shim — server uses real firebase-admin/auth. */
module.exports = {
  getAuth: function getAuth() {
    return {};
  },
};
