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
    'ui.bootstrap',
    'patternfly',
    'services.config'
]);

var auth = {};

angular.element(document).ready(function () {
    angular.injector(['services.config']).invoke(['configuration',function(configuration) {

        var keycloakAuth = new Keycloak({
          url: 'https://accounts.ulock.co/auth',
          realm: 'ulock',
          clientId: configuration.keycloakClient
        });

        auth.loggedIn = false;

        keycloakAuth.init({
            onLoad: 'login-required'
        }).success(function() {
            auth.loggedIn = true;
            auth.authz = keycloakAuth;
            ulockWebApp.factory('Auth', function() {
                return auth;
            });

            auth.authz.loadUserProfile().success(function(profile){
                 auth.profile = profile;
                 angular.bootstrap(document, ["ulockWebApp"]);
                });

        }).error(function() {
            alert("failed to login");
        });
    }]);
});

ulockWebApp.config(function($httpProvider, $routeProvider) {
    $httpProvider.interceptors.push('authInterceptor');

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

ulockWebApp.run(function ($rootScope, $location,locker) { //Insert in the function definition the dependencies you need.
    //Do your $on in here, like this:
    $rootScope.$on("$locationChangeStart",function(event, next, current){
        if(next.indexOf('/decrypt') == -1 && !locker.isOpen()) {
          event.preventDefault();
          $rootScope.$evalAsync(function() {
            $location.path('/decrypt');
          });
        }
    });
});

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
      } else if (response.status == 404) {
          alert("Not found");
      } else if (response.status) {
          if (response.data && response.data.errorMessage) {
              alert(response.data.errorMessage);
          } else {
              alert("An unexpected server error has occurred");
          }
      }
      return $q.reject(response);
    }
  };
});

ulockWebApp.controller('GlobalCtrl', function ($scope,Auth) {
  $scope.name = Auth.profile.firstName;
  $scope.logoutUrl = Auth.authz.createLogoutUrl();
  $scope.accountUrl = Auth.authz.createAccountUrl();
});
