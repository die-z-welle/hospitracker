var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Rooms = mongoose.model('Room');
var Beacons = mongoose.model('Beacon');
var Measurements = mongoose.model('Measurement');
var Persons = mongoose.model('Person');
var roomscore = require('../util/room-scoring');

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

router.get('/:id/usage', function(req, res) {
	var id = req.params.id;
  Rooms.findOne({'_id': id})
  .exec(function(err, room) {
	  Persons.find({}, function(err, users) {

			Measurements.find({})
			.populate('beacon')
			.limit(200)
			.exec(function(err, measurements) {
				// measurements = all measurements for current room
				var data = [];
				users.forEach(function(user) {
					var filteredMeasurements = measurements.filter(function(m) {
						return (m.person.toString() === user._id.toString());
					});
					var grouped = {};
					filteredMeasurements.forEach(function(measurement) {
						if (!grouped[measurement.time]) {
							grouped[measurement.time] = [];
						}
						grouped[measurement.time].push(measurement);
					});

					for (g in grouped) {
						data.push({user: user, time: g, values: grouped[g]})
					}
				});
				roomscore(data, function(rooms) {
					var result = [];
					var sorted = rooms.sort(function(a, b) { return (a.time < b.time) ? -1 : 1; });
					for (var i = 1; i < sorted.length; i++) {
						if (sorted[i-1].room._id.toString() === id) {
							sorted[i-1].exited = sorted[i].time;
							result.push(sorted[i-1]);
						}
					}
					res.send(result);
				});
			});

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
