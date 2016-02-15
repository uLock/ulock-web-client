'use strict';

describe('Service: passwords', function () {

  // load the service's module
  beforeEach(module('ulockWebApp'));

  // instantiate service
  var passwords;
  beforeEach(inject(function (_passwords_) {
    passwords = _passwords_;
  }));

  it('should do something', function () {
    expect(!!passwords).toBe(true);
  });

});
