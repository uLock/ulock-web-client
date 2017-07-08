'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:GroupCtrl
 * @description
 * # GroupCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('GroupCtrl', function($routeParams, $scope, $location, $http, groups, locker, users) {
    var groupId = $routeParams.id;

    if (groupId === 'new') {
      $scope.group = {};
    } else {
      //load
      groups.get(groupId, function(group) {
        $scope.group = group;
      });
    }

    $scope.save = function(group) {
      if (!group.id) {
        var secret = locker.createSecret();
        group.data = {
          secret: secret
        };
      }

      groups.save(group, function() {
        $location.path('/groups');
      });

    };

    $scope.cancel = function() {
      $location.path('/groups');
    };

    $scope.addMember = function(email) {
      users.get(email,function(user){
        console.log(user);
      });
    };

  });
