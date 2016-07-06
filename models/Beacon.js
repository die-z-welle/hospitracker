var mongoose = require('mongoose');

var BeaconSchema = new mongoose.Schema({
	mac: String,
  uuid: String,
  minor: Number,
  major: Number,
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' }
});

mongoose.model('Beacon', BeaconSchema);
