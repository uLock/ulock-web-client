'use strict';

angular.module('services.config', [])
  .constant('configuration', {
    ulockApi: '@@ulockApi',
    keycloakClient:'@@keycloakClient'
  });
