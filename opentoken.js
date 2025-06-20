/**
 * OpenToken for Node.JS
 * http://tools.ietf.org/html/draft-smith-opentoken-02
 */

var token  = require('./lib/token');
var decode = token.decode;
var encode = token.encode;
var obfuscatePassword = token.obfuscatePassword;
var deobfuscatePassword = token.deobfuscatePassword;


/**
 * OpenTokenAPI constructor
 * OpenTokenAPI is an object with utility methods for reading
 * and writing OpenTokens with some automatic validation, etc.
 * Note: Both CipherSuite and password null means unencrypted.
 *
 * @param {number} cipherSuite Cipher Suite ID (see ciphers.js)
 * @param {string} password    Encrypt/Decrypt password
 */
function OpenTokenAPI(cipherSuite, password, config) {

  this.cipherSuite = cipherSuite;
  this.password = password;

  // use additional config properties, if present
  config = config || {};
  this.timeTolerance = (config.tokenTolerance || 120) * 1000;   // 2 minutes
  this.tokenLifetime = (config.tokenLifetime || 300) * 1000;   // 5 minutes
  this.tokenRenewal  = (config.tokenRenewal  || 43200) * 1000; // renew 12 hrs

}

/**
 * Parse an OpenToken and apply basic validation checks
 *
 * @param  {string}   token  The raw token basd64 encoded string
 * @param  {function} cb     Callback function
 * @return {object} Key-value pairs from token, returned via callback
 */
OpenTokenAPI.prototype.parseToken = function (token, cb) {
  if (!token || !cb) {
    return null;
  }

  var self = this;

  decode(token, this.cipherSuite, this.password, processPayload);

  function processPayload(err, data) {
    if (err) {
      return cb(err);
    }

    // Parse data string into key/value pairs
    var index;
    var pairs = {};
    var kvps = data.split("\n");
    kvps.forEach(function (x,i,arr) {
      arr[i] = x.split(/=(.+)?/);
    });

    // Convert/add to the key's value array if multiple exist
    for (index in kvps) {
      var key = kvps[index][0], value = kvps[index][1];
      if (value == undefined || value == null) value = "";
      pairs[key] = key in pairs ? [].concat(pairs[key], value) : value
    }

    // Check the minimum required key/value pairs.
    if (!pairs.subject) {
      return cb(new Error("OpenToken missing 'subject'"));
    }

    var now          = new Date();
    var tolerance    = new Date(Date.now() + self.timeTolerance);
    var notBefore    = new Date(pairs['not-before']);
    var notOnOrAfter = new Date(pairs['not-on-or-after']);
    var renewUntil   = new Date(pairs['renew-until']);

    if (notBefore > notOnOrAfter) {
      return cb(new Error("'not-on-or-after' should be above 'not-before'"));
    }

    if (notBefore > now && notBefore > tolerance) {
      err = new Error("Must not use this token before " + notBefore);
      return cb(err);
    }
 
    if (now > notOnOrAfter) {
      err = new Error("This token has expired as of " + notOnOrAfter);
      return cb(err);
    }

    if (now > renewUntil) {
      err = new Error("This token is past its renewal limit " + renewUntil);
      return cb(err);
    }

    return cb(null, pairs);
  }
};

/**
 * Create a token from an object of key-value pairs to encode.
 * @param  {object}   data  Object with key:value pairs to encode
 * @param  {function} cb    Callback
 * @return {string} base64-encoded token 
 */
OpenTokenAPI.prototype.createToken = function (pairs, cb) {

  if (!pairs || !cb) {
    return null;
  }

  // Set the minimum required key/value pairs.
  var now = new Date();
  var expiry = new Date(now.getTime() + this.tokenLifetime);
  var renewUntil = new Date(now.getTime() + this.tokenRenewal);

  if (!pairs.subject) {
    return cb(new Error("OpenToken missing 'subject'"));
  }

  // Format as "yyyy-MM-ddTHH:mm:ssZ" per OpenToken spec
  pairs['not-before'] = now.toISOString().split('.')[0] + 'Z';
  pairs['not-on-or-after'] = expiry.toISOString().split('.')[0] + 'Z';
  pairs['renew-until'] = renewUntil.toISOString().split('.')[0] + 'Z';

  // Parse key-value pairs into a string
  var item;
  var keyValues = [];
  for (item in pairs) {
    if (pairs.hasOwnProperty(item)) {
      keyValues.push(item + "=" + pairs[item]);
    }
  }

  keyValues = keyValues.join("\n");

  encode(keyValues, this.cipherId, this.password, cb);
  
};

/**
 * Create the obfuscated password from a UTF-8-encoded password.
 *
 * @param  {string} utf8Password UTF-8-encoded password
 * @param  {string} base64obfuscatedPasswordKey Base64-encoded obfuscation key for des-ede3-cbc
 * @param  {string} base64obfuscatedPasswordIv Base64-encoded obfuscation IV for des-ede3-cbc
 * @return {string} Base64-encoded obfuscated password
 */
OpenTokenAPI.prototype.obfuscatePassword = function (
  utf8Password, base64obfuscatePasswordKey, base64obfuscatePasswordIv) {
  return obfuscatePassword(utf8Password, base64obfuscatePasswordKey, base64obfuscatePasswordIv);
};

/**
 * Deobfuscate the given Base64-encoded obfuscated password.
 *
 * @param  {string} base64password Base64-encoded obfuscated password
 * @param  {string} base64obfuscatedPasswordKey Base64-encoded obfuscation key for des-ede3-cbc
 * @param  {string} base64obfuscatedPasswordIv Base64-encoded obfuscation IV for des-ede3-cbc
 * @return {string} UTF-8-encoded deobfuscated password
 */
OpenTokenAPI.prototype.deobfuscatePassword = function (
  base64password, base64obfuscatePasswordKey, base64obfuscatePasswordIv) {
  return deobfuscatePassword(base64password, base64obfuscatePasswordKey, base64obfuscatePasswordIv);
};

exports.OpenTokenAPI = OpenTokenAPI;
