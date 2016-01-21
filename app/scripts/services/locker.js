'use strict';

var sha256 = function (val) {
  var md = forge.md.sha256.create();
  md.update(val);
  return md.digest().toHex();
};

var pki = forge.pki;
var rsa = pki.rsa;

var masterPassword;
var settings;

/**
 * @ngdoc service
 * @name ulockWebApp.locker
 * @description
 * # locker
 * Service in the ulockWebApp.
 */
angular.module('ulockWebApp')
  .service('locker', function ($http, configuration) {

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

     this.encrypt = encrypt;

     /*
      * Decrypt cipher text using a password or passphrase and a corresponding salt and iv
      *
      * @param    string (Base64) cipherText
      * @param    string password
      * @param    string (Base64) salt
      * @param    string (Base64) iv
      * @return   string
      */
     var decrypt = function(encryptData) {
         var key = forge.pkcs5.pbkdf2(masterPassword, forge.util.decode64(encryptData.salt), 40, 16);
         var decipher = forge.cipher.createDecipher('AES-CBC', key);
         decipher.start({iv: forge.util.decode64(encryptData.iv)});
         decipher.update(forge.util.createBuffer(forge.util.decode64(encryptData.cipher_text)));
         decipher.finish();
         return decipher.output.toString();
     };

     this.decrypt = decrypt;

     var encryptEntity = function (entity) {
       var newEntity = angular.copy(entity);
       newEntity.data = encrypt(JSON.stringify(entity.data));
       return newEntity;
     };

     this.encryptEntity = encryptEntity;

     var decryptEntity = function (entity) {
       var newEntity = angular.copy(entity);
       newEntity.data = JSON.parse(decrypt(entity.data));
       return newEntity;
     };

     this.decryptEntity = decryptEntity;

     var createNewAccount = function (callback) {

        // generate an RSA key pair synchronously
        var keypair = rsa.generateKeyPair({bits: 2048, e: 0x10001});
        settings = {
          publicKey: pki.publicKeyToPem(keypair.publicKey),
          data: {
            privateKey: pki.privateKeyToPem(keypair.privateKey)
          }
        };

        var newSettings = encryptEntity(settings);

        $http.post(configuration.ulockApi+'/settings',newSettings).then(function(response) {
            var encryptSettings = response.data;
            settings = decryptEntity(encryptSettings);
            callback(true);
        });

     };

     this.isOpen = function () {
       return masterPassword && settings;
     };

     this.open = function (masterKey, callback) {
       masterPassword = masterKey;

       $http.get(configuration.ulockApi+'/settings').then(function success(response) {
         var encryptSettings = response.data;
         if(encryptSettings.id) {
           //try to decrypt data to test the masterPassword
           try {
             var decrypted = decryptEntity(encryptSettings);
               settings = decrypted;
               callback(true);
           } catch (ex) {
              alert('fail to decrypt');
           }

         } else {
           //new account
           //TODO add confirm masterKey
           createNewAccount(callback);

         }
       },function error(response) {
         callback(false);
       });

     };

  });
