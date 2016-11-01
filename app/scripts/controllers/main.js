'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('MainCtrl', function($scope, pfViewUtils, $location, passwords, Notifications) {

    $scope.notifications = Notifications.data;

    $scope.filtersText = '';
    $scope.allItems = [];
    $scope.items = [];
    var reload = function() {
      passwords.list(function(values) {
        if (values) {
          $scope.allItems = values;
          $scope.items = $scope.allItems;
          $scope.toolbarConfig.filterConfig.resultsCount = values.length;
        }
      });
    };

    reload();

    var matchesFilter = function(item, filter) {
      return item.data[filter.id].toLowerCase().match(filter.value.toLowerCase()) !== null;
    };

    var matchesFilters = function(item, filters) {
      var matches = true;

      filters.forEach(function(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;
          return false;
        }
      });
      return matches;
    };

    var applyFilters = function(filters) {
      $scope.items = [];
      if (filters && filters.length > 0) {
        $scope.allItems.forEach(function(item) {
          if (matchesFilters(item, filters)) {
            $scope.items.push(item);
          }
        });
      } else {
        $scope.items = $scope.allItems;
      }
    };

    var filterChange = function(filters) {
      $scope.filtersText = "";
      filters.forEach(function(filter) {
        $scope.filtersText += filter.title + " : " + filter.value + "\n";
      });
      applyFilters(filters);
      $scope.toolbarConfig.filterConfig.resultsCount = $scope.items.length;
    };

    $scope.filterConfig = {
      fields: [{
        id: 'name',
        title: 'Name',
        placeholder: 'Filter by Name...',
        filterType: 'text'
      }, {
        id: 'username',
        title: 'Username',
        placeholder: 'Filter by Username...',
        filterType: 'text'
      }, {
        id: 'email',
        title: 'Email',
        placeholder: 'Filter by Email...',
        filterType: 'text'
      }],
      resultsCount: $scope.items.length,
      appliedFilters: [],
      onFilterChange: filterChange
    };

    var viewSelected = function(viewId) {
      $scope.viewType = viewId;
    };

    $scope.viewsConfig = {
      views: [pfViewUtils.getCardView(), pfViewUtils.getListView()],
      onViewSelect: viewSelected
    };
    $scope.viewsConfig.currentView = $scope.viewsConfig.views[0].id;
    $scope.viewType = $scope.viewsConfig.currentView;


    var compareFn = function(item1, item2) {
      var compValue = 0;
      if ($scope.sortConfig.currentField.id === 'name') {
        compValue = item1.data.name.localeCompare(item2.data.name);
      } else if ($scope.sortConfig.currentField.id === 'username') {
        compValue = item1.data.username - item2.data.username;
      } else if ($scope.sortConfig.currentField.id === 'email') {
        compValue = item1.data.email.localeCompare(item2.data.email);
      }

      if (!$scope.sortConfig.isAscending) {
        compValue = compValue * -1;
      }

      return compValue;
    };

    var sortChange = function(sortId, isAscending) {
      $scope.items.sort(compareFn);
    };

    $scope.sortConfig = {
      fields: [{
        id: 'name',
        title: 'Name',
        sortType: 'alpha'
      }, {
        id: 'username',
        title: 'Username',
        sortType: 'alpha'
      }, {
        id: 'email',
        title: 'Email',
        sortType: 'alpha'
      }],
      onSortChange: sortChange
    };

    var performAction = function(action) {
      Notifications.info('This action is not supported for the moment');
    };

    var addAction = function(action) {
      $location.path('/passwords/new');
    };

    var selectedItems = [];

    var deleteAction = function() {
      async.each(selectedItems, function(selected, callback) {
        passwords.delete(selected.id, callback);
      }, reload);
    };

    $scope.actionsConfig = {
      primaryActions: [{
        name: 'Add',
        title: 'Add new password',
        actionFn: addAction
      }, {
        name: 'Share',
        title: 'Share a password',
        actionFn: performAction
      }, {
        name: 'Delete',
        title: 'Delete passwords',
        actionFn: deleteAction
      }],
      moreActions: [{
        name: 'Export',
        title: 'Export password',
        actionFn: performAction
      }]
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

    $scope.handleCheckBoxChange = function(item) {
      if (item.selected) {
        selectedItems.push(item);
      } else {
        selectedItems.splice(selectedItems.indexOf(item), 1);
      }
    };


    $scope.passwordCopied = function() {
      Notifications.success(
        'Password copied!'
      );

    };

    $scope.fail = function(err) {
      Notifications.error(err);
    };

  });
