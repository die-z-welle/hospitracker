var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Beacons = require('../models/Beacon');
var BSON = require('bson');

/* GET Beacons listing. */
router.get('/', function(req, res, next) {
  Beacons.find({}, function(err, docs) {
    if (err) {
      console.err('errors occurred on querying Beacons');
    }
    res.send(docs);
  });
});

router.get('/:id', function(req, res) {
   var id = req.params.id;
   Beacons.findOne({'_id': new BSON.ObjectID(id)}, function(err, beacon) {
      res.send(beacon);
   });
});

/* GET Beacons listing. */
router.post('/', function(req, res, next) {
  var item = req.body;
  item._id = null;
  new Beacons(item).save();
  res.send(item);
});

module.exports = router;
