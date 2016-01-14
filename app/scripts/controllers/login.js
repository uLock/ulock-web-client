'use strict';

/**
 * @ngdoc function
 * @name pboxWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the pboxWebApp
 */
angular.module('pboxWebApp')
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
