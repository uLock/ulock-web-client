'use strict';

/**
 * @ngdoc overview
 * @name ulockWebApp
 * @description
 * # ulockWebApp
 *
 * Main module of the application.
 */
var ulockWebApp = angular.module('ulockWebApp', [
  'ngAnimate',
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'angular-clipboard',
  'ngCsv',
  'patternfly',
  'services.config'
]);


ulockWebApp.config(function($routeProvider) {

  $routeProvider
    .when('/decrypt', {
      templateUrl: 'views/login.html',
      controller: 'LoginCtrl'
    })
    .when('/passwords', {
      templateUrl: 'views/main.html',
      controller: 'MainCtrl'
    })
    .when('/passwords/:id', {
      templateUrl: 'views/password.html',
      controller: 'PasswordCtrl',
      controllerAs: 'password'
    })
    .when('/generator', {
      templateUrl: 'views/generator.html',
      controller: 'GeneratorCtrl',
      controllerAs: 'generator'
    })
    .otherwise({
      redirectTo: '/passwords'
    });
});

ulockWebApp.run(['$rootScope', '$location', 'locker', function($rootScope, $location, locker) { //Insert in the function definition the dependencies you need.

  //Do your $on in here, like this:
  $rootScope.$on("$locationChangeStart", function(event, next, current) {
    if (next.indexOf('/decrypt') == -1 && !locker.isOpen()) {
      event.preventDefault();
      $rootScope.$evalAsync(function() {
        $location.path('/decrypt');
      });
    }
  });
}]);

ulockWebApp.factory('authInterceptor', function($q, Auth) {
  return {
    request: function(config) {
      var deferred = $q.defer();
      if (Auth.authz.token) {
        Auth.authz.updateToken(5).success(function() {
          config.headers = config.headers || {};
          config.headers.Authorization = 'Bearer ' + Auth.authz.token;

          deferred.resolve(config);
        }).error(function() {
          deferred.reject('Failed to refresh token');
        });
      }
      return deferred.promise;
    },
    response: function(response) {
      return response;
    },
    responseError: function(response) {
      if (response.status == 401) {
        console.log('session timeout?');
        logout();
      } else if (response.status == 403) {
        alert("Forbidden");
      } 
      // return $q.reject(response);
      return response;
    }

  };
});




ulockWebApp.config(function($httpProvider) {
  // $httpProvider.responseInterceptors.push('errorInterceptor');
  $httpProvider.interceptors.push('authInterceptor');

});

ulockWebApp.controller('GlobalCtrl', function($scope, Auth) {
  $scope.name = Auth.profile.firstName;
  $scope.logoutUrl = Auth.authz.createLogoutUrl();
  $scope.accountUrl = Auth.authz.createAccountUrl();
});
