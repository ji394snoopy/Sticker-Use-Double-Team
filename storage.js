const firebase = require('firebase');

const config = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: ""
};

firebase.initializeApp(config);

module.exports.getValueBy = function(ref) {
  return ref.once('value');
};

module.exports.setValueWith = function(ref, obj) {
  return ref.set(obj);
};

module.exports.getRef = function(query) {
  return firebase.database().ref(query);
}
