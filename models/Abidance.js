var mongoose = require('mongoose');

var AbidanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room'},
  joined: Date,
  left: Date,
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person'}
});

mongoose.model('Abidance', AbidanceSchema);
