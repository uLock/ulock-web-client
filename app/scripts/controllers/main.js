'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
    .controller('MainCtrl',  function ($scope, pfViewUtils, $uibModal,$log,locker,$location,$http,configuration) {

    if(!locker.isOpen()) {
      $location.path('/');
    }

    $http.get(configuration.ulockApi+"/site").then(function(response) {
     var encryptedSites = response.data;
     encryptedSites.forEach(function (encryptedSite) {
       $scope.allItems.push(locker.decryptEntity(encryptedSite));
     });
   });

   var saveNewSite = function (site,callback) {
     var encryptedSite = locker.encryptEntity(site);
     $http.post(configuration.ulockApi+'/site',encryptedSite).then(function(response) {
       callback(locker.decryptEntity(response.data));
     },function (err) {
       console.log('Error!!'+err);
     });
   };

    $scope.allItems = [];

    $scope.items = $scope.allItems;

    var matchesFilter = function (item, filter) {
      var match = true;

      if (filter.id === 'name') {
        match = item.data.name.match(filter.value) !== null;
      } else if (filter.id === 'username') {
        match = item.data.username.match(filter.value) !== null;
      }
      return match;
    };

    var matchesFilters = function (item, filters) {
      var matches = true;

      filters.forEach(function(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;
          return false;
        }
      });
      return matches;
    };

    var applyFilters = function (filters) {
      $scope.items = [];
      if (filters && filters.length > 0) {
        $scope.allItems.forEach(function (item) {
          if (matchesFilters(item, filters)) {
            $scope.items.push(item);
          }
        });
      } else {
        $scope.items = $scope.allItems;
      }
    };

    var filterChange = function (filters) {
      applyFilters(filters);
      $scope.toolbarConfig.filterConfig.resultsCount = $scope.items.length;
    };

    $scope.filterConfig = {
      fields: [
        {
          id: 'name',
          title:  'Name',
          placeholder: 'Filter by Name...',
          filterType: 'text'
        },
        {
          id: 'username',
          title:  'Username',
          placeholder: 'Filter by Username...',
          filterType: 'text'
        }
      ],
      resultsCount: $scope.items.length,
      appliedFilters: [],
      onFilterChange: filterChange
    };

    var viewSelected = function(viewId) {
      $scope.viewType = viewId
    };

    $scope.viewsConfig = {
      views: [pfViewUtils.getListView(), pfViewUtils.getTilesView()],
      onViewSelect: viewSelected
    };
    $scope.viewsConfig.currentView = $scope.viewsConfig.views[0].id;
    $scope.viewType = $scope.viewsConfig.currentView;

    var compareFn = function(item1, item2) {
      var compValue = 0;
      if ($scope.sortConfig.currentField.id === 'name') {
        compValue = item1.data.name.localeCompare(item2.data.name);
      } else if ($scope.sortConfig.currentField.id === 'username') {
        compValue = item1.data.username.localeCompare(item2.data.username);
      }

      if (!$scope.sortConfig.isAscending) {
        compValue = compValue * -1;
      }

      return compValue;
    };

    var sortChange = function (sortId, isAscending) {
      $scope.items.sort(compareFn);
    };

    $scope.sortConfig = {
      fields: [
        {
          id: 'name',
          title:  'Name',
          sortType: 'alpha'
        },
        {
          id: 'username',
          title:  'Username',
          sortType: 'alpha'
        }
      ],
      onSortChange: sortChange
    };

    var performAction = function (action) {
      alert('not implemented '+action.name);
    };

   var addAction =  function (size) {
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
           alert('to implement');
         }
         else {
           saveNewSite(site,function (newSite) {
             $scope.allItems.push(newSite);
           });
         }
        }, function () {
          $log.info('Modal dismissed at: ' + new Date());
        });

    };

    $scope.actionsConfig = {
      primaryActions: [
        {
          name: 'Add',
          title: 'Add new password',
          actionFn: addAction
        },
        {
          name: 'Generate',
          title: 'Generate random password',
          actionFn: performAction
        }
      ]
    };

    $scope.toolbarConfig = {
      viewsConfig: $scope.viewsConfig,
      filterConfig: $scope.filterConfig,
      sortConfig: $scope.sortConfig,
      actionsConfig: $scope.actionsConfig
    };

    $scope.listConfig = {
      selectionMatchProp: 'name',
      checkDisabled: false
    };
  });

angular.module('ulockWebApp').controller('ModalInstanceCtrl', function($scope, $uibModalInstance, site) {

    $scope.site = site || {};

    $scope.ok = function() {
        if ($scope.site.data.password === $scope.confirmPassword) {
            $uibModalInstance.close($scope.site);
        } else {
            alert('password don t matche');
        }

    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
});
