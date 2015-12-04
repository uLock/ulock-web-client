'use strict';

/**
 * @ngdoc function
 * @name pboxWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pboxWebApp
 */
angular.module('pboxWebApp')
  .controller('MainCtrl', ['locker', function (locker) {
    this.sites = [
      {
        title : 'Google' ,
        url : 'https://google.com',
        username : 'xjodoin',
        password:'123456'
      },
      {
        title : 'Google' ,
        url : 'https://google.com',
        username : 'x@cakemail.com',
        password:'123456'
      },
      {
        title : 'Facebook' ,
        url : 'https://facebook.com',
        username : 'xjodoin',
        password:'123456'
      }
    ];

    this.test = function (tocrypt) {
        alert(locker.encrypt(tocrypt,'this is my pass'));
    };

  }]);
