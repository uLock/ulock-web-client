'use strict';

/**
 * @ngdoc overview
 * @name pboxWebApp
 * @description
 * # pboxWebApp
 *
 * Main module of the application.
 */
var module = angular.module('pboxWebApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-clipboard',
    'ui.bootstrap',
    'services.config'
]);


var auth = {};
var logout = function() {
    console.log('*** LOGOUT');
    auth.loggedIn = false;
    auth.authz = null;
    window.location = auth.logoutUrl;
};


angular.element(document).ready(function($http) {
    console.log("*** here");

    var keycloakAuth = new Keycloak({
      url: 'https://accounts.ulock.co/auth',
      realm: 'ulock',
      clientId: 'ulock-web'
    });

    auth.loggedIn = false;

    keycloakAuth.init({
        onLoad: 'login-required'
    }).success(function() {
        auth.loggedIn = true;
        auth.authz = keycloakAuth;
        auth.logoutUrl = keycloakAuth.createLogoutUrl();
        module.factory('Auth', function() {
            return auth;
        });

        auth.authz.loadUserProfile().success(function(profile){
             auth.profile = profile;
             angular.bootstrap(document, ["pboxWebApp"]);
            });

    }).error(function() {
        alert("failed to login");
    });
});

module.config(function($httpProvider, $routeProvider) {
    $httpProvider.interceptors.push('authInterceptor');

    $routeProvider
        .when('/', {
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl'
        })
        .when('/site', {
            templateUrl: 'views/main.html',
            controller: 'MainCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
});

module.factory('authInterceptor', function($q, Auth) {
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

module.controller('GlobalCtrl', function ($scope,Auth) {
  $scope.name = Auth.profile.firstName;
  $scope.logoutUrl = Auth.logoutUrl;
});
