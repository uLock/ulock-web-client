'use strict';

/**
 * @ngdoc service
 * @name ulockWebApp.passwords
 * @description
 * # passwords
 * Service in the ulockWebApp.
 */
angular.module('ulockWebApp')
  .service('passwords', function($http, configuration, locker) {

    var decryptResponse = function(callback) {
      return function(res) {
        var password = res.data;
        if (password) {
          var decrypt = locker.decryptEntity(password);
          callback(decrypt);
        } else {
          callback();
        }
      };
    };

    this.get = function(id, callback) {
      $http.get(configuration.ulockApi + '/passwords/' + id).then(decryptResponse(callback));
    };

    this.delete = function(id, callback) {
      $http.delete(configuration.ulockApi + '/passwords/' + id).then(callback);
    };

    this.save = function(pass, callback) {
      if (pass.id) {
        $http.put(configuration.ulockApi + '/passwords/' + pass.id, locker.encryptEntity(pass)).then(decryptResponse(callback));
      } else {
        $http.post(configuration.ulockApi + '/passwords', locker.encryptEntity(pass)).then(decryptResponse(callback));
      }
    };

    this.list = function(callback) {
      $http.get(configuration.ulockApi + '/passwords').then(function(res) {
        var encryptedPasswords = res.data;
        if (encryptedPasswords && encryptedPasswords.length > 0) {
          var passwords = [];
          _.each(encryptedPasswords, function(pass) {
            try {
               passwords.push(locker.decryptEntity(pass));
            } catch (ex) {
              console.error('cannot decrypt entity ' + pass.id);
              console.error(ex);
            }
          });
          callback(passwords);
        } else {
          callback();
        }

      });
    };

  });
