/** Browser bundle shim — server uses real firebase-admin/firestore. */
module.exports = {
  getFirestore: function getFirestore() {
    return {};
  },
};
