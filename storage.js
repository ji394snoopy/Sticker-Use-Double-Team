const firebase = require('firebase')
const config = require('./config')

firebase.initializeApp(config.firebase)

module.exports.getValueBy = function (ref) {
  return ref.once('value')
}

module.exports.setValueWith = function (ref, obj) {
  return ref.set(obj)
}

module.exports.getRef = function (query) {
  return firebase.database().ref(query)
}
