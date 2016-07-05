var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Rooms = require('../models/Room');
var Beacons = require('../models/Beacon');
var BSON = require('bson');

/* GET Rooms listing. */
router.get('/', function(req, res, next) {
  Rooms.find({}, function(err, docs) {
    if (err) {
      console.err('errors occurred on querying Rooms');
    }
    res.send(docs);
  });
});

router.get('/:id', function(req, res) {
   var id = req.params.id;
   Rooms.findOne({'_id': new BSON.ObjectID(id)})
   .exec(function(err, room) {
     Beacons.find({'room': new BSON.ObjectID(room._id)}, function(err, docs) {
       room.beacons = docs;
       res.send(room);
     });
  });
});

/* GET Rooms listing. */
router.post('/', function(req, res, next) {
  var item = req.body;
  item._id = null;
  new Rooms(item).save();
  res.send(item);
});

router.delete('/:id', function(req, res) {
  var id = req.params.id;
  Rooms.findOne({'_id': new BSON.ObjectID(id)}, function(err, room) {
    room.remove();
    res.send('');
  });
});

module.exports = router;
