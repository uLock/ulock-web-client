'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('LoginCtrl', function(Auth, $scope, locker, $location, Notifications) {

    $scope.loading = true;
    var newUser = true;
    var message;

    locker.loadUser(function (exist){

      if(exist) {
        message = 'Enter your master passphrase';
        newUser = false;
        locker.automaticDecrypt(Auth.profile, function(success) {
          if (success) {
            $location.path('/passwords');
          }
          else{
            $scope.loading = false;
          }
        });
      }
      else {
        $scope.loading = false;
        message = 'Enter a complex passphrase to lock your account';
      }

    });

    $scope.getMessage = function() {
      return message;
    };

    var tmpPass;
    $scope.open = function(masterpassword) {

      if(newUser && masterpassword !== tmpPass) {
        if(!tmpPass) {
            tmpPass = masterpassword;
        }
        $scope.password='';
        message = "Reenter your passphrase we can't recover your passwords you need to remember the passphrase";
      }
      else {
        locker.open(Auth.profile, masterpassword, true, function(success) {

          if (success) {
            $location.path('/passwords');
          } else {
            Notifications.warn('Wrong master passphrase!!');
          }
        });
      }



    };
  });
