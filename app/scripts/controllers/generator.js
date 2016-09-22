'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:GeneratorCtrl
 * @description
 * # GeneratorCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('GeneratorCtrl', function ($scope) {
    $scope.passwordlength = 20;
    $scope.generate = function () {
      $scope.newPassword = generatePassword($scope.passwordlength,false);
    };

    $scope.generate();

  });
