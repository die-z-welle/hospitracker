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
    .when('/test', {
        templateUrl: '/templates/test.html',
        controller: 'MainCtrl',
        activetab: 'test'
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
.controller('UserDetailCtrl', function($scope, $routeParams, UserService) {
  $scope.user = UserService.findById({id: $routeParams.id});
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
