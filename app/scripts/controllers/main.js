'use strict';

/**
 * @ngdoc function
 * @name ulockWebApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the ulockWebApp
 */
angular.module('ulockWebApp')
  .controller('MainCtrl', function($scope, $location, passwords) {
    $scope.eventText = '';
    var handleSelect = function(item, e) {
      $scope.eventText = item.name + ' selected\r\n' + $scope.eventText;
    };
    var handleSelectionChange = function(selectedItems, e) {
      $scope.eventText = selectedItems.length + ' items selected\r\n' + $scope.eventText;
    };
    var handleClick = function(item, e) {
      $scope.eventText = item.name + ' clicked\r\n' + $scope.eventText;
    };
    var handleDblClick = function(item, e) {
      $scope.eventText = item.name + ' double clicked\r\n' + $scope.eventText;
    };
    var handleCheckBoxChange = function(item, selected, e) {
      $scope.eventText = item.name + ' checked: ' + item.selected + '\r\n' + $scope.eventText;
    };

    var checkDisabledItem = function(item) {
      return $scope.showDisabled;
    };

    $scope.enableButtonForItemFn = function(action, item) {
      return true;
    };

    $scope.updateMenuActionForItemFn = function(action, item) {
      return true;
    };

    $scope.selectType = 'checkbox';
    $scope.updateSelectionType = function() {
      if ($scope.selectType === 'checkbox') {
        $scope.config.selectItems = false;
        $scope.config.showSelectBox = true;
      } else if ($scope.selectType === 'row') {
        $scope.config.selectItems = true;
        $scope.config.showSelectBox = false;
      } else {
        $scope.config.selectItems = false
        $scope.config.showSelectBox = false;
      }
    };

    $scope.showDisabled = false;

    $scope.config = {
      selectItems: false,
      multiSelect: false,
      dblClick: false,
      selectionMatchProp: 'name',
      selectedItems: [],
      checkDisabled: checkDisabledItem,
      showSelectBox: true,
      onSelect: handleSelect,
      onSelectionChange: handleSelectionChange,
      onCheckBoxChange: handleCheckBoxChange,
      onClick: handleClick,
      onDblClick: handleDblClick
    };

    passwords.list(function(values) {
      $scope.items = values;
    });

    var performAction = function(action, item) {
      alert('Not supported!');
    };

    var editAction = function(action, item) {
      $location.path('/passwords/' + item.id);
    };

    $scope.actionButtons = [{
      name: 'Edit',
      title: 'Edit the password',
      actionFn: editAction
    }, {
      name: 'Delete',
      title: 'Delete the password',
      actionFn: performAction
    }];
    $scope.menuActions = [{
      name: 'Share',
      title: 'Share the password with another user',
      actionFn: performAction
    }];

    $scope.exportPasswords = function () {
      return _.map($scope.items,function (item) {
        return item.data;
      });
    };

  });
