var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Rooms = mongoose.model('Room');
var Beacons = mongoose.model('Beacon');

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
   Rooms.findOne({'_id': id})
   .exec(function(err, room) {
     Beacons.find({'room': room._id}, function(err, docs) {
       room.beacons = docs;
       res.send(room);
     });
  });
});

/* GET Rooms listing. */
router.post('/', function(req, res, next) {
  var item = req.body;

	var beacons = item.beacons;
	item.beacons = [];
	new Rooms(item).save(function(err, room) {
		if (beacons) {
			beacons.forEach(function(beacon) {
				beacon.room = room._id;
				Beacons.findOneAndUpdate({'_id': beacon._id}, beacon, function(err) {});
			});
		}
		res.send(room);
	});
});

router.delete('/:id', function(req, res) {
  var id = req.params.id;
  Rooms.findOne({'_id': id}, function(err, room) {
    room.remove();
    res.send('');
  });
});

module.exports = router;
