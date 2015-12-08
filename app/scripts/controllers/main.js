'use strict';

/**
 * @ngdoc function
 * @name pboxWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pboxWebApp
 */
angular.module('pboxWebApp')
  .controller('MainCtrl', ['locker','$scope', '$uibModal','$log','$routeParams', function (locker, $scope, $uibModal,$log,$routeParams) {

    var accountKey = $routeParams.accountKey;

    locker.load(accountKey, function (err,sites) {
      $scope.sites = sites;
    });


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
          $scope.sites.push(site);
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });

    };

}]);

angular.module('pboxWebApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, site) {

  $scope.site = site || {};

  $scope.ok = function () {
    $uibModalInstance.close($scope.site);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
