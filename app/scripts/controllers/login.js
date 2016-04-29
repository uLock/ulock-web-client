'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('LoginCtrl', function($scope, locker, $location, Notifications) {

    $scope.loading = true;
    locker.automaticDecrypt(function(success) {
      if (success) {
        $location.path('/passwords');
      }
      else{
        $scope.loading = false;
      }
    });

    $scope.open = function(masterpassword) {
      locker.open(masterpassword, true, function(success) {
        if (success) {
          $location.path('/passwords');
        } else {
          Notifications.warn('Wrong master password!!');
        }
      });

    };
  });
