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
    $scope.login = function (email,password) {
      var vaultKey = locker.createAccountKey(email,password);
      $location.path('/vault/'+vaultKey);
    };
  });
