var mongoose = require('mongoose');
var Beacon = mongoose.model('Beacon');
var Room = mongoose.model('Room');

var transformRSSItoScore = function(rssi) {
  return Math.pow((parseInt(rssi) + 100), 2);
}

var roomscore = function(beaconList, callback) {
	Beacon.find({}).populate('room').exec(function(err, result) {

    for(i in result) {
      for(j in beaconList) {
        if(result[i].mac == beaconList[j].mac) {
          result[i].value = beaconList[j].value;
        }
      }
    }

    var rooms = {};
    for (i in result) {
			if(result[i].room != undefined) {
        rooms[result[i].room.identification] = {score: 0, numberOfBeacons: 0, dividedScore: 0};
      }
		}

    for (i in result) {
			if(result[i].room != undefined) {
        var rssi = result[i].value;

        rooms[result[i].room.identification].score += transformRSSItoScore(rssi);
        rooms[result[i].room.identification].numberOfBeacons++;
        console.log("RoomNr. " + result[i].room.identification + ", Score: " + transformRSSItoScore(rssi));

      }
		}

    for(i in rooms) {
      rooms[i].dividedScore = rooms[i].score / rooms[i].numberOfBeacons;
      console.log(i + ", " + JSON.stringify(rooms[i]));
    }

    //console.log(rooms);

	  var winner = null;
	  var totalscore = 0;
	  for(i in rooms) {
	    totalscore += rooms[i].dividedScore;
	    if(winner == null) {
	      winner = i;
	    } else {
	      if(rooms[winner].dividedScore < rooms[i].dividedScore) {
	        winner = i;
	      }
	    }
	  }



	  var accuracy = rooms[winner].dividedScore / totalscore;
	  callback(winner, accuracy);
	});
}

module.exports = roomscore;
