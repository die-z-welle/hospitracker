var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/Users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  Users.find({}, function(err, docs) {
    if (err) {
      console.err('errors occurred on querying users');
    }
    res.send(docs);
  });
});

router.get('/:id', function(req, res) {
   var id = req.params.id;
   User.findOne({'_id': new BSON.ObjectID(id)}, function(err, user) {
      res.send(user);
   });
});

/* GET users listing. */
router.post('/', function(req, res, next) {
  var item = req.body;
  item._id = null;
  new Users(item).save();
  res.send(item);
});

module.exports = router;
