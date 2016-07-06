var mongoose = require('mongoose');
var Beacon = mongoose.model('Beacon');
var Room = mongoose.model('Room');

var populateBeacon = function(beacon, callback) {
  Beacon.findOne({'minor': beacon.minor, 'major': beacon.major, 'uuid': beacon.uuid})
	.populate('room')
	.exec(function(err, beacon) {
    //console.log(beacon);
		callback(beacon);
  });
}

var transformRSSItoScore = function(rssi) {
  return -(rssi + 26);
}

var roomscore = function(beaconList, callback) {
	Beacon.find({}).populate('room').exec(function(err, result) {
  	var beacons = [];
	  for(i in beaconList) {
			var b = result.filter(function(value) {
					return value.minor === beaconList[i].minor && value.major === beaconList[i].major && value.uuid === beaconList[i].uuid;
				});
			beacons.push(b);
			beaconList[i].room = b.room;
	  }

		for (i in beacons) {
			console.log(JSON.stringify(beacons[i]));
		}

	  var rooms = {};
	  for(i in beaconList) {
	    if(beaconList[i].hasOwnProperty("room")) {
		    var rssi = beaconList[i].value;
		    rooms[beaconList[i].room.identification] = transformRSSItoScore(rssi);
	    }
	  }

	  var winner = null;
	  var totalscore = 0;
	  for(i in rooms) {
	    totalscore += rooms[i];
	    if(winner == null) {
	      winner = i;
	    } else {
	      if(rooms[winner] < rooms[i]) {
	        winner = i;
	      }
	    }
	  }

	  var accuracy = rooms[winner] / totalscore;
	  callback(winner, accuracy);
	});
}

module.exports = roomscore;
