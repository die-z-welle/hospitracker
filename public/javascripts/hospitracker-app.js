angular.module('hospitracker', ['ngResource', 'ngRoute'])
.run(function($rootScope, $route) {
    $rootScope.isActive = function(route) {
      if ($route && $route.current) {
        return $route.current.activetab === route;
      }
      return false;
    };
})
.config(['$locationProvider', '$routeProvider', function config($locationProvider, $routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: '/templates/landingpage.html',
        controller: 'MainCtrl',
        activetab: 'landingpage'
    })
    .when('/beacons', {
        templateUrl: '/templates/beacons.html',
        controller: 'BeaconCtrl',
        activetab: 'beacons'
    })
    .when('/rooms', {
        templateUrl: '/templates/rooms.html',
        controller: 'RoomCtrl',
        activetab: 'rooms'
    })
    .when('/roomdetail/:id', {
        templateUrl: '/templates/roomdetail.html',
        controller: 'RoomDetailCtrl',
        activetab: 'rooms'
    })
    .when('/users', {
        templateUrl: '/templates/users.html',
        controller: 'UserCtrl',
        activetab: 'users'
    })
    .when('/userdetail/:id', {
        templateUrl: '/templates/userdetail.html',
        controller: 'UserDetailCtrl',
        activetab: 'users'
    })
    .otherwise('/');
}])
.controller('MainCtrl', function($scope) {

})
.controller('UserCtrl', function($scope, $location, UserService) {
  $scope.users = [];

  $scope.refresh = function() {
    $scope.users = UserService.find();
  };

  $scope.refresh();

  $scope.create = function() {
    UserService.create($scope.newUser).$promise.then(function() {
      $scope.refresh();
      $scope.newUser = null;
    });
  };

  $scope.go = function(userid) {
    $location.path('/userdetail/' + userid);
  };
})
.controller('BeaconCtrl', function($scope, $location, BeaconService, RoomService) {
  $scope.beacons = [];
  $scope.rooms = [];

  $scope.refresh = function() {
    $scope.rooms = RoomService.find();
    $scope.beacons = BeaconService.find();
  };

  $scope.refresh();

  $scope.create = function() {
    BeaconService.create($scope.newBeacon).$promise.then(function() {
      $scope.refresh();
      $scope.newBeacon = null;
    });
  };

  $scope.delete = function(id) {
    BeaconService.delete({id: id}).$promise.then(function() {
      $scope.refresh();
    });
  };
})
.controller('RoomCtrl', function($scope, $location, RoomService, BeaconService) {
  $scope.rooms = [];
	$scope.beacons = [];
	$scope.activeBeacons = {};

  $scope.refresh = function() {
    $scope.rooms = RoomService.find();
		$scope.beacons = BeaconService.find();
  };

  $scope.refresh();

  $scope.create = function() {
    RoomService.create($scope.newRoom).$promise.then(function() {
      $scope.refresh();
      $scope.newRoom = null;
    });
  };

  $scope.delete = function(id) {
    RoomService.delete({id: id}).$promise.then(function() {
      $scope.refresh();
    });
  };

	$scope.go = function(roomid) {
    $location.path('/roomdetail/' + roomid);
  };

	$scope.getIdentifier = function(beacon) {
		return getIdentifier(beacon);
	}

	function getIdentifier(beacon) {
		return beacon.uuid + '.' + beacon.minor + '.' + beacon.major;
	};

	$scope.toggleBeacon = function(beacon) {
		if (!angular.isDefined($scope.newRoom.beacons)) {
			$scope.newRoom.beacons = [];
		}

		var found = false;
		for (var i = 0; i < $scope.newRoom.beacons.length; i++) {
			var beaconEntry = $scope.newRoom.beacons[i];
			if (beaconEntry.uuid === beacon.uuid && beaconEntry.minor === beacon.minor && beaconEntry.major === beacon.major) {
				found = true;
				$scope.newRoom.beacons.splice(i, 1);
			}
		}

		$scope.activeBeacons[getIdentifier(beacon)] = !found;
		if (!found) {
			$scope.newRoom.beacons.push(beacon);
		}

		console.log(getIdentifier(beacon) + " " + $scope.activeBeacons[getIdentifier(beacon)]);
	};

	$scope.isActive = function(beacon) {
		return $scope.activeBeacons[getIdentifier(beacon)];
	};

})
.controller('RoomDetailCtrl', function($scope, $routeParams, RoomService, BeaconService) {
  $scope.room = {};
  $scope.beacons = [];

  $scope.refresh = function() {
    $scope.room = RoomService.findById({id: $routeParams.id});
    $scope.beacons = BeaconService.find();
  };
  $scope.refresh();

  $scope.addBeacon = function(beacon) {
    beacon.room = $scope.room._id;
    BeaconService.update({id: beacon._id}, beacon).$promise.then(function() {
      $scope.refresh();
      $scope.newBeaconEntry = null;
    });
  };

  $scope.removeBeacon = function(beacon) {
    beacon.room = null;
    console.log(JSON.stringify(beacon));
    BeaconService.update({id: beacon._id}, beacon).$promise.then(function() {
      $scope.refresh();
      $scope.newBeaconEntry = null;
    });
  };
})
.controller('UserDetailCtrl', function($scope, $routeParams, UserService) {
  $scope.user = UserService.findById({id: $routeParams.id});
})
.service('BeaconService', function($resource) {
    return $resource('/beacons/:id', {}, {
        find: {
            method: 'GET',
            isArray: true
        },
        create: {
            method: 'POST'
        },
        update: {
            method: 'PUT',
            params: {
              id: '@id'
            }
        },
        delete: {
            method: 'DELETE',
            params: {
                id: '@id'
            }
        }
    });
})
.service('RoomService', function($resource) {
    return $resource('/rooms/:id', {}, {
        find: {
            method: 'GET',
            isArray: true
        },
        findById: {
            method: 'GET',
            params: {
              id: '@id'
            }
        },
        create: {
            method: 'POST'
        },
        delete: {
            method: 'DELETE',
            params: {
                id: '@id'
            }
        }
    });
})

.service('UserService', function($resource) {
    return $resource('/users/:id', {}, {
        find: {
            method: 'GET',
            isArray: true
        },
        findById: {
            method: 'GET',
            params: {
                id: '@id'
            }
        },
        create: {
            method: 'POST'
        },
        delete: {
            method: 'DELETE',
            params: {
                id: '@id'
            }
        }
    });
});
