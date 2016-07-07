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

.controller('MainCtrl', function($scope, UserService, MeasurementService) {
  UserService.find().$promise.then(function(result) {
		$scope.users = result;
		$scope.users.forEach(function(user) {
			UserService.lastlocation({id: user._id}).$promise.then(function(loc) {
					user.location = loc;
					user.location.time = $scope.dateFormat(new Date(loc.time));
			});
		});
	});
	$scope.measurements = MeasurementService.find();

	$scope.dateFormat = function(d) {
		return doubleDigits(d.getDate()) + '.' + doubleDigits(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + doubleDigits(d.getHours()) + ':' + doubleDigits(d.getMinutes()) + ':' + doubleDigits(d.getSeconds());
	};

	function doubleDigits(number) {
		return (number < 10) ? ('0' + number) : number;
	};

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

  $scope.delete = function(id) {
    UserService.delete({id: id}).$promise.then(function() {
      $scope.refresh();
    });
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
		return beacon.mac;
	};

	$scope.toggleBeacon = function(beacon) {
		if (!angular.isDefined($scope.newRoom.beacons)) {
			$scope.newRoom.beacons = [];
		}

		var found = false;
		for (var i = 0; i < $scope.newRoom.beacons.length; i++) {
			var beaconEntry = $scope.newRoom.beacons[i];
			if (beaconEntry.mac === beacon.mac) {
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
    RoomService.findById({id: $routeParams.id}).$promise.then(function(room) {
			$scope.room = room;
			$scope.room.usage = [];

			RoomService.usage({id: room._id}).$promise.then(function(usages) {
				var separatedValues = {};

				var max = 0;
				var min = 0;
				$scope.userMap = [];
				usages.forEach(function(u) {
					if (!separatedValues[u.user._id]) {
						separatedValues[u.user._id] = [];
						$scope.userMap.push(u.user);
					}
					u.time = new Date(u.time);
					u.exited = new Date(u.exited);
					separatedValues[u.user._id].push(u);

					if (min == 0 || u.time.getTime() < min) {
						min = u.time.getTime();
					}
					if (max < u.exited.getTime()) {
						max = u.exited.getTime();
					}
					$scope.room.usage.push(u);
				});

				$scope.usages = [];
				for (i in separatedValues) {
					$scope.usages.push(separatedValues[i].sort(function(a, b) { return (a.time.getTime() - b.time.getTime()); } ));
				}

				var totalLength = max - min;
				$scope.usages.forEach(function(entry) {
					var lastExited = min;
					entry.forEach(function(u) {
						u.left = (u.time.getTime() - lastExited) / totalLength;
						u.width = (u.exited.getTime() - u.time.getTime()) / totalLength;
						lastExited = u.exited.getTime();
					});
				});
				$scope.max = new Date(max);
				$scope.min = new Date(min);
			});
		});
    $scope.beacons = BeaconService.find();
  };

	$scope.getUser = function(index) {
		return $scope.userMap[index];
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
    BeaconService.update({id: beacon._id}, beacon).$promise.then(function() {
      $scope.refresh();
      $scope.newBeaconEntry = null;
    });
  };

	function dateFormat(d) {
		return doubleDigits(d.getDate()) + '.' + doubleDigits(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + doubleDigits(d.getHours()) + ':' + doubleDigits(d.getMinutes()) + ':' + doubleDigits(d.getSeconds());
	};

	function doubleDigits(number) {
		return (number < 10) ? ('0' + number) : number;
	};

})

.controller('UserDetailCtrl', function($scope, $routeParams, UserService) {
  UserService.findById({id: $routeParams.id}).$promise.then(function(user) {
		$scope.user = user;
		user.locations = [];
		UserService.locations({id: user._id}).$promise.then(function(locs) {
			locs.forEach(function(loc) {
				var l = loc;
				l.time = $scope.dateFormat(new Date(loc.time));
				user.locations.push(l);
			});
		});
	});

	$scope.dateFormat = function(d) {
		return doubleDigits(d.getDate()) + '.' + doubleDigits(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + doubleDigits(d.getHours()) + ':' + doubleDigits(d.getMinutes()) + ':' + doubleDigits(d.getSeconds());
	};

	function doubleDigits(number) {
		return (number < 10) ? ('0' + number) : number;
	};
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
    return $resource('/rooms/:id/:page', {}, {
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
        },
				usage: {
					method: 'GET',
					params: {
						id: '@id',
						page: 'usage'
					},
					isArray: true
				}
    });
})
.service('UserService', function($resource) {
  return $resource('/users/:id/:page', {}, {
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
    },
		locations: {
			method: 'GET',
			params: {
				id: '@id',
				page: 'locations'
			},
			isArray: true
		},
		lastlocation: {
			method: 'GET',
			params: {
				id: '@id',
				page: 'lastlocation'
			}
		}
  });
})
.service('MeasurementService', function($resource) {
  return $resource('/measurements', {}, {
    find: {
      method: 'GET',
      isArray: true
    }
  });
});
