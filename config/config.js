'use strict';

var auth = {};
var logout = function(){
    console.log('*** LOGOUT');
    auth.loggedIn = false;
    auth.authz = null;
    window.location = auth.logoutUrl;
};

angular.element(document).ready(function ($http) {
    console.log("*** here");
    var keycloakAuth = new Keycloak('@@keycloakClient');
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
    ulockApi: '@@ulockApi'
  });
