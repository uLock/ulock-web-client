'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('MainCtrl', function($scope, pfViewUtils,$location, passwords) {
    $scope.filtersText = '';
    $scope.allItems = [];
    $scope.items = [];

    passwords.list(function(values) {
      if(values) {
        $scope.allItems = values;
        $scope.items = $scope.allItems;
      }
    });

    var matchesFilter = function(item, filter) {
      var match = true;

      if (filter.id === 'name') {
        match = item.data.name.match(filter.value) !== null;
      } else if (filter.id === 'username') {
        match = item.data.username === parseInt(filter.value);
      } else if (filter.id === 'email') {
        match = item.data.email.match(filter.value) !== null;
      }
      return match;
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
      $scope.viewType = viewId
    };

    $scope.viewsConfig = {
      views: [pfViewUtils.getCardView(),pfViewUtils.getListView()],
      onViewSelect: viewSelected
    };
    $scope.viewsConfig.currentView = $scope.viewsConfig.views[0].id;
    $scope.viewType = $scope.viewsConfig.currentView;


    var compareFn = function(item1, item2) {
      var compValue = 0;
      if ($scope.sortConfig.currentField.id === 'name') {
        compValue = item1.name.localeCompare(item2.name);
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
      alert('Not supported!');
    };

    var addAction = function(action) {
      $location.path('/passwords/new');
    };

    var editAction = function(action,elem) {
      console.log(action);
      // $location.path('/password/new');
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
  });
