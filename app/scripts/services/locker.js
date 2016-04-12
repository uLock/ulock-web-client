'use strict';

var sha256 = function(val) {
  var md = forge.md.sha256.create();
  md.update(val);
  return md.digest().toHex();
};

var pki = forge.pki;
var rsa = pki.rsa;

/**
 * @ngdoc service
 * @name ulockWebApp.locker
 * @description
 * # locker
 * Service in the ulockWebApp.
 */
angular.module('ulockWebApp')
  .service('locker', function($http, configuration) {

    /*
     * Encrypt a message with a passphrase or password
     *
     * @param    string message
     * @param    string password
     * @return   object
     */
    var encrypt = function(message, secret) {
      if (secret) {
        var salt = forge.random.getBytesSync(128);
        var key = forge.pkcs5.pbkdf2(secret, salt, 40, 16);
        var iv = forge.random.getBytesSync(16);
        var cipher = forge.cipher.createCipher('AES-CBC', key);
        cipher.start({
          iv: iv
        });
        cipher.update(forge.util.createBuffer(message));
        cipher.finish();
        var cipherText = forge.util.encode64(cipher.output.getBytes());
        return {
          cipher_text: cipherText,
          salt: forge.util.encode64(salt),
          iv: forge.util.encode64(iv)
        };
      } else {
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
    var decrypt = function(encryptData, secret) {
      var key = forge.pkcs5.pbkdf2(secret, forge.util.decode64(encryptData.salt), 40, 16);
      var decipher = forge.cipher.createDecipher('AES-CBC', key);
      decipher.start({
        iv: forge.util.decode64(encryptData.iv)
      });
      decipher.update(forge.util.createBuffer(forge.util.decode64(encryptData.cipher_text)));
      decipher.finish();
      return decipher.output.toString();
    };

    this.decrypt = decrypt;

    var encryptEntity = function(entity, secret) {
      if (!secret) {
        secret = sessionStorage.getItem("secret");
      }

      var newEntity = angular.copy(entity);
      newEntity.data = encrypt(JSON.stringify(entity.data), secret);
      return newEntity;
    };

    this.encryptEntity = encryptEntity;

    var decryptEntity = function(entity, secret) {
      if (!secret) {
        secret = sessionStorage.getItem("secret");
      }

      var newEntity = angular.copy(entity);
      newEntity.data = JSON.parse(decrypt(entity.data, secret));
      return newEntity;
    };

    this.decryptEntity = decryptEntity;

    var createNewAccount = function(masterKey, callback) {

      // generate an RSA key pair synchronously
      var keypair = rsa.generateKeyPair({
        bits: 2048,
        e: 0x10001
      });

      // get some random bytes synchronously
      var bytes = forge.random.getBytesSync(32);
      var secret = forge.util.bytesToHex(bytes);

      var settings = {
        publicKey: pki.publicKeyToPem(keypair.publicKey),
        data: {
          secret: secret,
          privateKey: pki.privateKeyToPem(keypair.privateKey)
        }
      };

      var newSettings = encryptEntity(settings, masterKey);

      $http.post(configuration.ulockApi + '/user', newSettings).then(function(response) {
        var encryptSettings = response.data;
        settings = decryptEntity(encryptSettings, masterKey);
        sessionStorage.setItem('secret', settings.data.secret);
        callback(true);
      });

    };


    this.automaticDecrypt = function(next) {
      if (localStorage.getItem('deviceId') && localStorage.getItem('encryptedKey')) {
        $http.get(configuration.ulockApi + '/decrypt/' + localStorage.getItem('deviceId')).then(function(response) {
          if (response.data.key) {
            var decryptKey = response.data;
            var masterKey = decrypt(JSON.parse(localStorage.getItem('encryptedKey')), decryptKey.key);
            openLocker(masterKey,false, next);
          } else {
            next(false);
          }

        });
      } else {
        next(false);
      }
    };

    this.isOpen = function(next) {
      return !!sessionStorage.getItem("secret");
    };

    var createRemenberMe = function(masterKey) {

      var deviceId = localStorage.getItem('deviceId');

      if (!deviceId) {
        deviceId = forge.util.bytesToHex(forge.random.getBytesSync(32));
        localStorage.setItem('deviceId', deviceId);
      }

      $http.post(configuration.ulockApi + '/decrypt/' + deviceId).then(function(response) {
        var decryptKey = response.data;
        var encryptedInfo = encrypt(masterKey, decryptKey.key);
        localStorage.setItem('encryptedKey', JSON.stringify(encryptedInfo))
      });
    };

    var openLocker = function(masterKey, saveRememberMe, callback) {

      $http.get(configuration.ulockApi + '/user').then(function success(response) {
        var encryptSettings = response.data;
        if (encryptSettings.id) {
          //try to decrypt data to test the masterPassword
          try {
            var decrypted = decryptEntity(encryptSettings, masterKey);
            var settings = decrypted;
            sessionStorage.setItem('secret', settings.data.secret);
            if (saveRememberMe) {
              createRemenberMe(masterKey);
            }
            callback(true);
          } catch (ex) {
            alert('fail to decrypt');
          }

        } else {
          //new account
          //TODO add confirm masterKey
          createNewAccount(masterKey, function(result) {
            if (result) {
              createRemenberMe(masterKey);
            }
            callback(result);
          });

        }
      }, function error(response) {
        callback(false);
      });

    };

    this.open = openLocker;

  });
