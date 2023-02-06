var bitcoin = require("./btc16.js");

var kit = {
  verifyhash(keyPair, signature, hash) {
    try {
      var v = keyPair.verify(hash, Buffer.from(signature, "hex"));

      return v;
    } catch (e) {
      return false;
    }
  },

  addressByPublicKey: function (pubkey) {
    return bitcoin.payments.p2pkh({
      pubkey: pubkey,
    }).address;
  },
};

var Pocketnet = {
  keyPair: function (privateKey) {
    var keyPair = null;

    try {
      keyPair = bitcoin.ECPair.fromWIF(privateKey); //(Buffer.from(privateKey, 'hex'))
    } catch (e) {}

    return keyPair;
  },

  addressByPublicKey: function (pubkey) {
    return bitcoin.payments.p2pkh({
      pubkey: pubkey,
    }).address;
  },

  parsesignature: function (nonce) {
    var ch = nonce.split(",");
    var obj = {};

    ch.forEach(function (p) {
      var ch2 = p.split("=");

      if (!ch2[1] || !ch2[0]) return;

      obj[ch2[0]] = ch2[1];
    });

    return obj;
  },

  authorization: {
    signatureOld(signature = {}, addresses) {
      if (!signature.pubkey) return false;
      if (!signature.nonce) return false;
      if (!signature.address) return false;

      try {
        var pkbuffer = Buffer.from(signature.pubkey, "hex");

        var keyPair = bitcoin.ECPair.fromPublicKey(pkbuffer);

        var hash = Buffer.from(signature.nonce, "utf8");

        var verify =
          keyPair.verify(hash, Buffer.from(signature.signature, "hex")) &&
          signature.address == Pocketnet.addressByPublicKey(pkbuffer);

        if (!addresses) addresses = signature.address;

        if (!Array.isArray(addresses)) addresses = [addresses];

        console.log("Verification successfull");

        return verify && addresses.includes(signature.address);
      } catch (e) {
        return false;
      }
    },

    signature: function (signature = {}, addresses) {
      if (!signature.pubkey)
        return {
          valid: false,
          error: "NO_PUBKEY",
        };
      if (!signature.nonce)
        return {
          valid: false,
          error: "NO_NOONCE",
        };
      if (!signature.address)
        return {
          valid: false,
          error: "NO_ADDRESS_CHECKING",
        };

      try {
        var pkbuffer = Buffer.from(signature.pubkey, "hex");

        var keyPair = bitcoin.ECPair.fromPublicKey(pkbuffer);
        var hash = Buffer.from(signature.nonce, "utf8");
        var hashtrue = bitcoin.crypto.sha256(
          Buffer.from(signature.nonce, "utf8")
        );
        var verify = false;

        var passedHash = signature.v ? hashtrue : hash;

        if (!kit.verifyhash(keyPair, signature.signature, passedHash)) {
          return {
            valid: false,
            error: "HASH_VERIFICATION_ERROR",
          };
        }

        if (!(signature.address === kit.addressByPublicKey(pkbuffer))) {
          console.log('ADR', signature.address, kit.addressByPublicKey(pkbuffer));
          return {
            valid: false,
            error: "ADDRESS_VERIFICATION_ERROR",
          };
        }

        // Old verification
        // if (!signature.v) {
        //   var verify =
        //     kit.verifyhash(keyPair, signature.signature, hash) &&
        //     signature.address === kit.addressByPublicKey(pkbuffer);
        // } else {
        //   var verify =
        //     kit.verifyhash(keyPair, signature.signature, hashtrue) &&
        //     signature.address === kit.addressByPublicKey(pkbuffer);
        // }

        if (!addresses) addresses = signature.address;

        if (!Array.isArray(addresses)) addresses = [addresses];

        if (!addresses.includes(signature.address)) {
          return {
            valid: false,
            error: "ADDRESS_NOT_INCLUDED_IN_SIGNATURE",
          };
        }

        return {
          valid: true,
        };
      } catch (e) {
        return {
          valid: false,
          error: "CHECKING_EXECUTION_ERROR",
          body: JSON.stringify(e || {}),
        };
      }
    },
  },

  address: {
    validation: function (address) {
      var valid = true;

      try {
        bitcoin.address.fromBase58Check(address);
      } catch (e) {
        valid = false;
      }

      return valid;
    },
  },
};

module.exports = Pocketnet;
