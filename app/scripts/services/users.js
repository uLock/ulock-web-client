'use strict';

/**
 * @ngdoc service
 * @name ulockWebApp.users
 * @description
 * # users
 * Service in the ulockWebApp.
 */
angular.module('ulockWebApp')
  .service('users', function ($http, configuration) {
    this.get = function(email, callback) {
      $http.get(configuration.ulockApi + '/users?email=' +email).then(function(res) {
        callback(res.data[0]);
      });
    };
  });
