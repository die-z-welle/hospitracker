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
  return parseInt(rssi) + 100;
}

var roomscore = function(beaconList, callback) {
	Beacon.find({}).populate('room').exec(function(err, result) {

      for(i in result) {

        for(j in beaconList) {

          if(result[i].minor == beaconList[j].minor) {
            result[i].value = beaconList[j].value;

          }
        }
      }








    var rooms = {};

    for (i in result) {
			if(result[i].room != undefined) {
        rooms[result[i].room.identification] = 0;
      }
		}

    for (i in result) {
			if(result[i].room != undefined) {
        var rssi = result[i].value;

        rooms[result[i].room.identification] += transformRSSItoScore(rssi);
        console.log("RoomNr. " + result[i].room.identification + ", Score: " + transformRSSItoScore(rssi));

      }
		}

    for(i in rooms) {
      console.log(i + ", " + rooms[i]);
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
