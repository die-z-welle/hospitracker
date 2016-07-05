var mongoose = require('mongoose');

var BeaconSchema = new mongoose.Schema({
  uuid: String,
  minor: Number,
  major: Number,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

module.exports = mongoose.model('Beacon', BeaconSchema);
