var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Measurements = mongoose.model('Measurement');
var Person = mongoose.model('Person');
var Beacon = mongoose.model('Beacon');
var roomscore = require('../util/room-scoring');

/* GET Measurements listing. */
router.get('/', function(req, res, next) {
  Measurements.find({})
	.populate('person')
	.populate('beacon')
	.exec(function(err, docs) {
    if (err) {
      console.err('errors occurred on querying Measurements');
    }
    res.send(docs);
  });
});

/* GET Measurements listing. */
router.post('/', function(req, res, next) {
  var item = req.body;

  roomscore(item.measurements, function(room, accuracy) {
    console.log("RoomNr. " + room + ", Accuracy: " + accuracy);
  });

	Person.findOne({'deviceId': item.deviceId}, function(err, person) {
		if (person) {
			item.measurements.forEach(function(beaconMeasurement) {
				Beacon.findOne({'minor': beaconMeasurement.minor, 'major': beaconMeasurement.major, 'uuid': beaconMeasurement.uuid}, function(err, beacon) {
					if (beacon) {
						var measurement = {
							"time": beaconMeasurement.datetime,
							"value": beaconMeasurement.value,
							"person": person,
							"beacon": beacon
						};
					  new Measurements(measurement).save();
					  res.send(measurement);
					} else {
						console.log('no beacon found for ' + beaconMeasurement.uuid + ' ' + beaconMeasurement.minor + ' ' + beaconMeasurement.major);
					}
				});
			});
		} else {
			console.log('no person found for deviceId' + item.deviceId);
		}
	});
});


/*
{"measurements":[{"major":"24624","uuid":"8deefbb9f7384297804096668bb44281","value":"-68","datetime":"2016-07-06T07:02:08","mac":"ce:b9:ce:b8:11:38","minor":"49191"},{"major":"4144","uuid":"8deefbb9f7384297804096668bb44281","value":"-67","datetime":"2016-07-06T07:02:08","mac":"de:64:3a:46:4f:08","minor":"56634"},{"major":"10691","uuid":"0208001107757ed3e418284a0c8362c2","value":"-58","datetime":"2016-07-06T07:02:08","mac":"88:c6:26:45:6e:a5","minor":"42714"},{"major":"20528","uuid":"8deefbb9f7384297804096668bb44281","value":"-66","datetime":"2016-07-06T07:02:08","mac":"e9:a5:7d:f2:10:3a","minor":"49206"},{"major":"12498","uuid":"b9407f30f5f8466eaff925556b57fe6d","value":"-68","datetime":"2016-07-06T07:02:08","mac":"d5:ff:56:86:30:d2","minor":"22150"},{"major":"52517","uuid":"efd08370a247c89837e7b5634df52425","value":"-78","datetime":"2016-07-06T07:02:08","mac":"c0:17:a8:40:38:d1","minor":"52683"},{"major":"4144","uuid":"8deefbb9f7384297804096668bb44281","value":"-67","datetime":"2016-07-06T07:02:08","mac":"c2:14:5a:5f:62:f7","minor":"16563"},{"major":"4145","uuid":"8deefbb9f7384297804096668bb44281","value":"-70","datetime":"2016-07-06T07:02:08","mac":"d4:b9:6c:a4:24:da","minor":"48959"},{"major":"43557","uuid":"efd08370a247c89837e7b5634df52425","value":"-69","datetime":"2016-07-06T07:02:08","mac":"d7:ef:7b:45:e2:89","minor":"43723"},{"major":"52005","uuid":"efd08370a247c89837e7b5634df52425","value":"-72","datetime":"2016-07-06T07:02:08","mac":"f9:eb:e6:ec:a2:2e","minor":"52171"},{"major":"2944","uuid":"b9407f30f5f8466eaff925556b57fe6d","value":"-73","datetime":"2016-07-06T07:02:08","mac":"da:45:a1:5a:0b:80","minor":"41306"},{"major":"51239","uuid":"0613ff4c000c0e008477aea49c668899","value":"-79","datetime":"2016-07-06T07:02:08","mac":"48:2b:97:d8:9c:37","minor":"55971"}],"deviceId":1}
{"measurements":[{"major":"12498","uuid":"b9407f30f5f8466eaff925556b57fe6d","value":"-70","datetime":"2016-07-06T07:02:01","mac":"d5:ff:56:86:30:d2","minor":"22150"},{"major":"12336","uuid":"8deefbb9f7384297804096668bb44281","value":"-66","datetime":"2016-07-06T07:02:01","mac":"ce:b9:ce:b8:11:38","minor":"49191"},{"major":"10691","uuid":"0208001107757ed3e418284a0c8362c2","value":"-56","datetime":"2016-07-06T07:02:01","mac":"88:c6:26:45:6e:a5","minor":"42714"},{"major":"8240","uuid":"8deefbb9f7384297804096668bb44281","value":"-65","datetime":"2016-07-06T07:02:01","mac":"e9:a5:7d:f2:10:3a","minor":"49206"},{"major":"24624","uuid":"8deefbb9f7384297804096668bb44281","value":"-68","datetime":"2016-07-06T07:02:01","mac":"de:64:3a:46:4f:08","minor":"56634"},{"major":"43557","uuid":"efd08370a247c89837e7b5634df52425","value":"-74","datetime":"2016-07-06T07:02:01","mac":"d7:ef:7b:45:e2:89","minor":"43723"},{"major":"24624","uuid":"8deefbb9f7384297804096668bb44281","value":"-58","datetime":"2016-07-06T07:02:01","mac":"c2:14:5a:5f:62:f7","minor":"16563"},{"major":"24625","uuid":"8deefbb9f7384297804096668bb44281","value":"-68","datetime":"2016-07-06T07:02:01","mac":"d4:b9:6c:a4:24:da","minor":"48959"},{"major":"52005","uuid":"efd08370a247c89837e7b5634df52425","value":"-78","datetime":"2016-07-06T07:02:01","mac":"f9:eb:e6:ec:a2:2e","minor":"52171"},{"major":"2944","uuid":"b9407f30f5f8466eaff925556b57fe6d","value":"-76","datetime":"2016-07-06T07:02:01","mac":"da:45:a1:5a:0b:80","minor":"41306"},{"major":"52517","uuid":"efd08370a247c89837e7b5634df52425","value":"-62","datetime":"2016-07-06T07:02:01","mac":"c0:17:a8:40:38:d1","minor":"52683"}],"deviceId":1}
*/


module.exports = router;
