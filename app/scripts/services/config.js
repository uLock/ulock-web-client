'use strict';

angular.module('services.config', [])
  .constant('configuration', {
    ulockApi: 'http://localhost:8080',
    keycloakClient:'ulock-web-dev'
  });
