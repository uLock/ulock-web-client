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
      return decipher.output.data;
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
      var decryptString = decrypt(entity.data, secret);
      newEntity.data = JSON.parse(decryptString);
      return newEntity;
    };

    this.decryptEntity = decryptEntity;

    this.createSecret = function() {
      var bytes = forge.random.getBytesSync(32);
      var secret = forge.util.bytesToHex(bytes);
      return secret;
    };

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


    this.automaticDecrypt = function(profile, next) {
      if (localStorage.getItem(profile.id+'_deviceId') && localStorage.getItem(profile.id+'_encryptedKey')) {
        $http.get(configuration.ulockApi + '/decrypt/' + localStorage.getItem(profile.id+'_deviceId')).then(function(response) {
          if (response.data.key) {
            var decryptKey = response.data;
            var masterKey = decrypt(JSON.parse(localStorage.getItem(profile.id+'_encryptedKey')), decryptKey.key);
            openLocker(profile, masterKey,false, next);
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

    var createRemenberMe = function(profile, masterKey) {

      var deviceId = localStorage.getItem(profile.id+'_deviceId');

      if (!deviceId) {
        deviceId = forge.util.bytesToHex(forge.random.getBytesSync(32));
        localStorage.setItem(profile.id+'_deviceId', deviceId);
      }

      $http.post(configuration.ulockApi + '/decrypt/' + deviceId).then(function(response) {
        var decryptKey = response.data;
        var encryptedInfo = encrypt(masterKey, decryptKey.key);
        localStorage.setItem(profile.id+'_encryptedKey', JSON.stringify(encryptedInfo))
      });
    };

    var encryptSettings;

    var loadUser = function(callback) {
      $http.get(configuration.ulockApi + '/user').then(function success(response) {
        encryptSettings = response.data;
        callback(!!encryptSettings.id);
      }, function error(response) {
        callback(false);
      });
    };

    var openLocker = function(profile,masterKey, saveRememberMe, callback) {

      if (encryptSettings.id) {
        //try to decrypt data to test the masterPassword
        try {
          var decrypted = decryptEntity(encryptSettings, masterKey);
          var settings = decrypted;
          sessionStorage.setItem('secret', settings.data.secret);
          if (saveRememberMe) {
            createRemenberMe(profile,masterKey);
          }
          callback(true);
        } catch (ex) {
          callback(false);
        }

      } else {
        //new account
        //TODO add confirm masterKey
        createNewAccount(masterKey, function(result) {
          if (result) {
            createRemenberMe(profile, masterKey);
          }
          callback(result);
        });

      }


    };
    this.loadUser = loadUser;
    this.open = openLocker;

  });
