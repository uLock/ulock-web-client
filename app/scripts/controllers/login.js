'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('LoginCtrl', function ($scope,locker,$location) {

    $scope.open = function (masterpassword) {
      locker.open(masterpassword, function (success) {
          if(success) {
            $location.path('/site');
          }
          else {
            alert('invalid!');
          }
      });

    };
  });
