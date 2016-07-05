var mongoose = require('mongoose');

var PersonSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  deviceId: Number,
  abidances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abidance'}]
});

module.exports = mongoose.model('Person', PersonSchema);
