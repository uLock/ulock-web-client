'use strict';

describe('Service: locker', function () {

  // load the service's module
  beforeEach(module('ulockWebApp'));

  // instantiate service
  var locker;
  beforeEach(inject(function (_locker_) {
    locker = _locker_;
  }));

  it('should do something', function () {
    expect(!!locker).toBe(true);
  });

});
