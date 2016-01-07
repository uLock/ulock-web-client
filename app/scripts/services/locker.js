'use strict';

var db , sites ;

var sha256 = function (val) {
  var md = forge.md.sha256.create();
  md.update(val);
  return md.digest().toHex();
};

/**
 * @ngdoc service
 * @name pboxWebApp.locker
 * @description
 * # locker
 * Service in the pboxWebApp.
 */
angular.module('pboxWebApp')
  .service('locker', function () {

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

       var info = JSON.parse(sessionStorage.getItem(accountKey));
       var email = info.email;
       var password = sha256(info.password);

       db = new Kinto({
          remote: "https://api.ulock.co/v1",
          headers: {
            Authorization: "Basic " + btoa('xjodoin:totopass')
          }
        });

       sites = db.collection("sites");

       var load = function () {
         sites.list().then(function (res) {
           callback(null,res.data);
         }).catch(callback);
       };

       sites.sync({
          strategy: Kinto.syncStrategy.SERVER_WINS
        })
          .then(result => {
            console.log(result);
            load();
          })
          .catch(error => {
            console.error(error);
            load();
          });


     };

     this.add = function (site,callback) {
       sites.create(site)
        .then(function (res) {
          callback(null,res.data);
          sites.sync({
             strategy: Kinto.syncStrategy.SERVER_WINS
           });
        })
        .catch(console.error.bind(console));
     };

     this.create = function (email,password, callback) {
       var vaultInfo = {
         key : createAccountKey(email,password),
         email : email
       };

     };

     var createAccountKey = function (email,password) {
        var key = sha256(email+password);
        sessionStorage.setItem(key, JSON.stringify({email:email,password:password}));
        return key;
     };

     this.createAccountKey = createAccountKey;

  });
