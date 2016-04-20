'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:PasswordCtrl
 * @description
 * # PasswordCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('PasswordCtrl', function($routeParams, $scope, $location, $http, passwords) {
    var passwordId = $routeParams.id;
    var isNew = passwordId === 'new';

    if (isNew) {
      $scope.pass = {
        data: {}
      };
    } else {
      //load
      passwords.get(passwordId, function(pass) {
        $scope.pass = pass;
      });
    }

    $scope.save = function(pass) {
      if(pass.website) {
        pass.logo = '//logo.clearbit.com/'+pass.website+'?size=50';
      }
      passwords.save(pass, function() {
        $location.path('/passwords');
      });
    };

    $scope.cancel = function() {
      $location.path('/passwords');
    };

  });
