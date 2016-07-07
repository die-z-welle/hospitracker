var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Persons = mongoose.model('Person');
var Measurements = mongoose.model('Measurement');
var roomscore = require('../util/room-scoring');


/* GET Persons listing. */
router.get('/', function(req, res, next) {
  Persons.find({}, function(err, docs) {
    if (err) {
      console.err('errors occurred on querying Persons');
    }
    res.send(docs);
  });
});

router.get('/:id', function(req, res) {
   var id = req.params.id;
   Persons.findOne({'_id': id}, function(err, user) {
      res.send(user);
   });
});


router.get('/:id/measurements', function(req, res) {
   var id = req.params.id;
   Persons.findOne({'_id': id})
	 .populate('measurements')
	 .exec(function(err, user) {
      res.send(user.measurements);
   });
});

router.get('/:id/lastlocation', function(req, res) {
	findRooms(req.params.id, 10, true, res);
});

router.get('/:id/locations', function(req, res) {
	findRooms(req.params.id, 100, false, res);
});

function findRooms(id, measurementLimit, single, res) {
  Persons.findOne({'_id': id}, function(err, user) {
		if (user) {
			Measurements.find({'person': user._id})
			.sort({'time': -1})
			.populate('beacon')
			.limit(measurementLimit)
			.exec(function(err, docs) {
				var measurements = {};
				docs.forEach(function(doc) {
					if (!measurements[doc.time]) {
						measurements[doc.time] = [];
					}
					measurements[doc.time].push(doc);
				});

				var test = [];
				for (i in measurements) {
					test.push({time: i, values: measurements[i], user: user});
				}
				roomscore(test, function(rooms) {
					var result = (single) ? rooms[0] : rooms;
					res.send(result);
				});
			});
		}
  });

};

/* GET Persons listing. */
router.post('/', function(req, res, next) {
  var item = req.body;
  new Persons(item).save();
  res.send(item);
});

router.delete('/:id', function(req, res) {
  var id = req.params.id;
  Persons.findOne({'_id': id}, function(err, user) {
    user.remove();
    res.send('');
	});
});


module.exports = router;
