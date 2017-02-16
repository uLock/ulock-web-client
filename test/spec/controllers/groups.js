'use strict';

describe('Controller: GroupsCtrl', function () {

  // load the controller's module
  beforeEach(module('ulockWebApp'));

  var GroupsCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    GroupsCtrl = $controller('GroupsCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(GroupsCtrl.awesomeThings.length).toBe(3);
  });
});
