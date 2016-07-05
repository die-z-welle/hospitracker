var mongoose = require('mongoose');

var RoomSchema = new mongoose.Schema({
  identification: String,
  designation: String,
  purpose: String,
  abidances: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Abidance' }],
  beacons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Beacon' }]
});

module.exports = mongoose.model('Room', RoomSchema);
