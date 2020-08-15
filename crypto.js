'use strict';
const crypto = require('crypto');
const util = require('./util');

module.exports = function Crypto(options) {
  util.enforceArgs(options, ['key', 'hmacKey']);

  let self = {};
  const algo = 'aes-256-ctr';
  const hmacAlgo = 'sha256';
  const key = Buffer.from(options.key, 'hex');
  const hmacKey = Buffer.from(options.key, 'hex');

  const constantTimeCompare = function (val1, val2) {
    var sentinel;
    if (val1.length !== val2.length) {
      return false;
    }
    for (var i = 0; i <= (val1.length - 1); i++) {
      sentinel |= val1.charCodeAt(i) ^ val2.charCodeAt(i);
    }
    return sentinel === 0;
  };

  const encrypt = function (plainText) {
    var IV = new Buffer(crypto.randomBytes(16));
    var cipherText;
    var hmac;
    var encryptor;

    encryptor = crypto.createCipheriv(algo, key, IV);
    encryptor.setEncoding('hex');
    encryptor.write(plainText);
    encryptor.end();

    cipherText = encryptor.read();

    hmac = crypto.createHmac(hmacAlgo, hmacKey);
    hmac.update(cipherText);
    hmac.update(IV.toString('hex'));

    return `${cipherText}|${IV.toString('hex')}|${hmac.digest('hex')}`;
  };

  const decrypt = function (cipherText) {
    var cipherBlob = cipherText.split('|');
    var ct = cipherBlob[0];
    var IV = new Buffer(cipherBlob[1], 'hex');
    var hmac = cipherBlob[2];
    var decryptor;

    const chmac = crypto.createHmac(hmacAlgo, hmacKey);
    chmac.update(ct);
    chmac.update(IV.toString('hex'));

    if (!constantTimeCompare(chmac.digest('hex'), hmac)) {
      throw new Error('Encrypted Blob has been tampered with.');
    }

    decryptor = crypto.createDecipheriv(algo, key, IV);
    const decryptedText = decryptor.update(ct, 'hex', 'utf8');
    return decryptedText + decryptor.final('utf-8');
  };

  const encryptBuffer = function (buffer) {
    var IV = crypto.randomBytes(16);
    var cipher;
    var hmac;
    var encryptor;

    encryptor = crypto.createCipheriv(algo, key, IV);
    cipher = Buffer.concat([encryptor.update(buffer), encryptor.final()]);

    hmac = crypto.createHmac(hmacAlgo, hmacKey);
    hmac.update(cipher);
    hmac.update(IV);

    return Buffer.concat([IV, hmac.digest(), cipher]);
  };

  const decryptBuffer = function (buffer) {
    var IV = buffer.slice(0, 16);
    var hmac = buffer.slice(16, 48);
    var cipher = buffer.slice(48);
    var decryptor;

    const chmac = crypto.createHmac(hmacAlgo, hmacKey);
    chmac.update(cipher);
    chmac.update(IV);

    if (!constantTimeCompare(chmac.digest('hex'), hmac.toString('hex'))) {
      throw new Error('Encrypted Blob has been tampered with.');
    }

    decryptor = crypto.createDecipheriv(algo, key, IV);
    const decrypted = Buffer.concat([decryptor.update(cipher), decryptor.final()]);
    return decrypted;
  };

  self.encrypt = function(arg) {
    return encrypt(arg);
  };

  self.decrypt = function(arg) {
    return decrypt(arg);
  };

  self.encryptBuffer = function(arg) {
    return encryptBuffer(arg);
  };

  self.decryptBuffer = function(arg) {
    return decryptBuffer(arg);
  };

  return self;
};
