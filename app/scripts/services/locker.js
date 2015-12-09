'use strict';

var uLockApi = 'http://localhost/v1';

/**
 * @ngdoc service
 * @name pboxWebApp.locker
 * @description
 * # locker
 * Service in the pboxWebApp.
 */
angular.module('pboxWebApp')
  .service('locker', function ($http) {

      var masterPassword;

      /*
      * Encrypt a message with a passphrase or password
      *
      * @param    string message
      * @param    string password
      * @return   object
      */
     var encrypt = function(message) {
         if(masterPassword) {
           var salt = forge.random.getBytesSync(128);
           var key = forge.pkcs5.pbkdf2(masterPassword, salt, 40, 16);
           var iv = forge.random.getBytesSync(16);
           var cipher = forge.cipher.createCipher('AES-CBC', key);
           cipher.start({iv: iv});
           cipher.update(forge.util.createBuffer(message));
           cipher.finish();
           var cipherText = forge.util.encode64(cipher.output.getBytes());
           return {cipher_text: cipherText, salt: forge.util.encode64(salt), iv: forge.util.encode64(iv)};
         }
         else {
           return null;
         }

     };

     /*
      * Decrypt cipher text using a password or passphrase and a corresponding salt and iv
      *
      * @param    string (Base64) cipherText
      * @param    string password
      * @param    string (Base64) salt
      * @param    string (Base64) iv
      * @return   string
      */
     var decrypt = function(cipherText, salt, iv) {
         var key = forge.pkcs5.pbkdf2(masterPassword, forge.util.decode64(salt), 40, 16);
         var decipher = forge.cipher.createDecipher('AES-CBC', key);
         decipher.start({iv: forge.util.decode64(iv)});
         decipher.update(forge.util.createBuffer(forge.util.decode64(cipherText)));
         decipher.finish();
         return decipher.output.toString();
     };

     this.load = function (accountKey, callback) {
       $http.get(uLockApi+"/vault/"+accountKey).then(function success (response) {
         callback(null,response.sites);
       },function error (err) {
         callback(err);
       });
     };

     this.create = function (email,password, callback) {
       var vaultInfo = {
         key : createAccountKey(email,password),
         email : email
       };
       $http.post(uLockApi+"/vault",vaultInfo).then(function success (response) {
         callback(null,response);
       },function error (err) {
         callback(err);
       });
     };

     var createAccountKey = function (email,password) {
        masterPassword = password;
        var md = forge.md.sha256.create();
        md.update(email,password);
        return md.digest().toHex();
     };

     this.createAccountKey = createAccountKey;

  });
