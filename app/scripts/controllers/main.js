'use strict';

/**
 * @ngdoc function
 * @name pboxWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pboxWebApp
 */
angular.module('pboxWebApp')
  .controller('MainCtrl', ['locker','$scope', '$uibModal','$log', function (locker, $scope, $uibModal,$log) {
    var sites = [
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

    $scope.sites = sites;

    $scope.add = function (size) {
        var modalInstance = $uibModal.open({
         animation: true,
         templateUrl: 'myModalContent.html',
         controller: 'ModalInstanceCtrl',
         size: size,
         resolve: {
           items: function () {
             return $scope.sites;
           }
         }
       });

       modalInstance.result.then(function (selectedItem) {
          $scope.selected = selectedItem;
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });

    };

}]);

angular.module('pboxWebApp').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $uibModalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
