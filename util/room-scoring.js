var mongoose = require('mongoose');
var Beacon = mongoose.model('Beacon');
var Room = mongoose.model('Room');

var getroom = function(beacon) {
  Beacon.findOne({'minor': beacon.minor, 'major': beacon.major, 'uuid': beacon.uuid})
	.populate('room')
	.exec(function(err, beacon) {
		return beacon;
  });
}

var transformRSSItoScore = function(rssi) {
  return -(rssi + 26);
}

var roomscore = function(beaconList, callback) {

  for(i in beaconList) {
    var _room = getroom(beaconList[i]);
    if(_room != null) {
      beaconList[i].room = _room.identification;
    } else {
        beaconList[i].room = null;
    }
  }

  var rooms = {};

  for(i in beaconList) {
    if(beaconList[i].room != null) {
      rooms[beaconList[i].room] = 0;
    }
  }


  for(i in beaconList) {
    var rssi = beaconList[i].value;
    rooms[beaconList[i].room] += transformRSSItoScore(rssi);
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
}

module.exports = roomscore;
