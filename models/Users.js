var mongoose = require('mongoose');

var UserSchema = {
  firstname: String,
  lastname: String
};

mongoose.model('User', UserSchema);
