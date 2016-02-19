'use strict';

describe('Service: keycloak', function () {

  // load the service's module
  beforeEach(module('ulockWebApp'));

  // instantiate service
  var keycloak;
  beforeEach(inject(function (_keycloak_) {
    keycloak = _keycloak_;
  }));

  it('should do something', function () {
    expect(!!keycloak).toBe(true);
  });

});
