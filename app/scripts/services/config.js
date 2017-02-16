'use strict';

var auth = {};

angular.element(document).ready(function($http) {
  var keycloakAuth = new Keycloak('keycloak.json');
  auth.loggedIn = false;

  keycloakAuth.init({
    onLoad: 'login-required'
  }).success(function() {
    console.log('here login');
    auth.loggedIn = true;
    auth.authz = keycloakAuth;
    ulockWebApp.factory('Auth', function() {
      return auth;
    });
    auth.authz.loadUserProfile().success(function(profile) {
      auth.profile = profile;
      angular.bootstrap(document, ["ulockWebApp"]);
    });
  }).error(function() {
    alert("failed to login");
  });
});


angular.module('services.config', [])
  .constant('configuration', {
    ulockApi: 'https://api.ulock.co'
  });
