var mongoose = require('mongoose');
var Beacon = mongoose.model('Beacon');
var Room = mongoose.model('Room');

var transformRSSItoScore = function(rssi) {
  return (parseInt(rssi) + 100);
}

var determinerooms = function(measurementsArrays, callback) {
	Beacon.find({}).populate('room').exec(function(err, beacons) {
		var rooms = [];
		measurementsArrays.forEach(function(measurements) {
			var scores = {};
			measurements.values.forEach(function(measurement) {
				var beacon = beacons.find(function(b) { return (measurement.beacon) && (b.mac === measurement.beacon.mac); });
				if (beacon) {
					var rssi = measurement.value;

					if (!scores[beacon.room.identification]) {
						scores[beacon.room.identification] = { time: measurements.time, user: measurements.user, value: 0, numberOfBeacons: 0, room: beacon.room, average: function() { return (this.value / this.numberOfBeacons); } };
					}
					scores[beacon.room.identification].value += transformRSSItoScore(rssi);
	        scores[beacon.room.identification].numberOfBeacons++;
				}
			});

			var total = 0;
			var winner = null;
			for (i in scores) {
				total += scores[i].average();
				var avg = scores[i].value / scores[i].numberOfBeacons;
				if (!winner || scores[i].average() > winner.average()) {
					winner = scores[i];
				}
			}
		  winner.accuracy = winner.average() / total;
			rooms.push(winner);
		});

		callback(rooms);
	});
};

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

module.exports = determinerooms;
