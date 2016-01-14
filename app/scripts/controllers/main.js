'use strict';

var rootApi = 'http://localhost:8080';

/**
 * @ngdoc function
 * @name pboxWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pboxWebApp
 */
angular.module('pboxWebApp')
  .controller('MainCtrl', ['locker','$scope', '$uibModal','$log','$routeParams','$location','$http', function (locker, $scope, $uibModal,$log,$routeParams,$location,$http) {

    if(!locker.isOpen()) {
      $location.path('/');
    }

    $scope.sites = [];

    $http.get(rootApi+"/site").then(function(response) {
      var encryptedSites = response.data;
      encryptedSites.forEach(function (encryptedSite) {
        $scope.sites.push(locker.decryptEntity(encryptedSite));
      });
    });

    var saveNewSite = function (site,callback) {
      var encryptedSite = locker.encryptEntity(site);
      $http.post(rootApi+'/site',encryptedSite).then(function(response) {
        callback(locker.decryptEntity(response.data));
      },function (err) {
        console.log('Error!!');
      })
    };


    $scope.add = function (size) {
        var modalInstance = $uibModal.open({
         animation: true,
         templateUrl: 'myModalContent.html',
         controller: 'ModalInstanceCtrl',
         size: size,
         resolve: {
           site : function () {
             return $scope.selectedSite;
           }
         }
       });

       modalInstance.result.then(function (site) {
         if(site.id) {
           alert('to implment');
         }
         else {
           saveNewSite(site,function (newSite) {
             $scope.sites.push(newSite);
           });
         }
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });

    };

}]);

angular.module('pboxWebApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, site) {

  $scope.site = site || {};

  $scope.ok = function () {
    if($scope.site.data.password === $scope.confirmPassword) {
      $uibModalInstance.close($scope.site);
    }
    else {
      alert('password don t matche');
    }

  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
