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

router.get('/:id/location', function(req, res) {
  var id = req.params.id;
  Persons.findOne({'_id': id}, function(err, user) {
		if (user) {
			Measurements.find({'person': user._id})
			.populate('beacon')
			.sort({'time': -1})
			.limit(20)
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
					test.push({time: i, values: measurements[i]});
				}
				roomscore(test, function(rooms) {
					res.send(rooms);
				});
			});
		}
  });
});

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
