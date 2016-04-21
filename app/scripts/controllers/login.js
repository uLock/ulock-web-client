'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('LoginCtrl', function($scope, locker, $location) {

    $scope.loading = true;
    locker.automaticDecrypt(function(success) {
      if (success) {
        $location.path('/passwords');
      }
      $scope.loading = false;
    });

    $scope.open = function(masterpassword) {
      locker.open(masterpassword, true, function(success) {
        if (success) {
          $location.path('/passwords');
        } else {
          alert('invalid!');
        }
      });

    };
  });
