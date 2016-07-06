var mongoose = require('mongoose');

var PersonSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  deviceId: Number,
  abidances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abidance'}]
});

mongoose.model('Person', PersonSchema);
