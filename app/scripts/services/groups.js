'use strict';

/**
 * @ngdoc service
 * @name ulockWebApp.groups
 * @description
 * # groups
 * Service in the ulockWebApp.
 */
angular.module('ulockWebApp')
  .service('groups', function ($http, configuration, locker) {
    var decryptResponse = function(callback) {
      return function(res) {
        var group = res.data;
        if (group) {
          var decrypt = locker.decryptEntity(group);
          callback(decrypt);
        } else {
          callback();
        }
      };
    };

    this.get = function(id, callback) {
      $http.get(configuration.ulockApi + '/groups/' + id).then(decryptResponse(callback));
    };

    this.delete = function(id, callback) {
      $http.delete(configuration.ulockApi + '/groups/' + id).then(callback);
    };

    this.save = function(group, callback) {
      if (group.id) {
        $http.put(configuration.ulockApi + '/groups/' + group.id, locker.encryptEntity(group)).then(decryptResponse(callback));
      } else {
        $http.post(configuration.ulockApi + '/groups', locker.encryptEntity(group)).then(decryptResponse(callback));
      }
    };

    this.list = function(callback) {
      $http.get(configuration.ulockApi + '/groups').then(function(res) {
        var encryptedgroups = res.data;
        if (encryptedgroups && encryptedgroups.length > 0) {
          var groups = [];
          _.each(encryptedgroups, function(group) {
            try {
               groups.push(locker.decryptEntity(group));
            } catch (ex) {
              console.error('cannot decrypt entity ' + group.id);
              console.error(ex);
            }
          });
          callback(groups);
        } else {
          callback();
        }

      });
    };
  });
