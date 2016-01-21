'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:RegisterCtrl
 * @description
 * # RegisterCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('RegisterCtrl', function ($scope,locker,$location) {
    $scope.register = function (email,pass,confirm) {
      if(pass === confirm) {
        locker.create(email,pass,function (err,success) {
          if(err) {
            $location.path('/');
          }
          else {
            $location.path('/vault/'+success);
          }
        });
      }
      else {
        return false;
      }
    };
  });
