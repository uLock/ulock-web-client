'use strict';

var auth = {};

angular.element(document).ready(function ($http) {
    console.log("*** here");
    var keycloakAuth = new Keycloak('keycloak-dev.json');
    auth.loggedIn = false;

    keycloakAuth.init({ onLoad: 'login-required' }).success(function () {
        console.log('here login');
        auth.loggedIn = true;
        auth.authz = keycloakAuth;
        ulockWebApp.factory('Auth', function() {
            return auth;
        });

        angular.bootstrap(document, ["ulockWebApp"]);

    }).error(function () {
            alert("failed to login");
        });
});


angular.module('services.config', [])
  .constant('configuration', {
    ulockApi: 'http://localhost:8080'
  });
