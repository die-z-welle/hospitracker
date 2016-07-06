var mongoose = require('mongoose');

var MeasurementSchema = new mongoose.Schema({
  time: Date,
  person: { type: mongoose.Schema.Types.ObjectId, ref: 'Person'},
  beacon: { type: mongoose.Schema.Types.ObjectId, ref: 'Beacon'},
  value: Number
});

mongoose.model('Measurement', MeasurementSchema);
