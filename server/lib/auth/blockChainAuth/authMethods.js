const pocketnet = require('./pocketnet.js');
const moment = require('moment');

module.exports = {

  v1({ address, nonce, pubkey, signature, v } = {}) {
    // Turned off time checking
    // if (v) {
    //   const parsedNonce = pocketnet.parsesignature(nonce);

    //   const creationDate = moment(parsedNonce.date);
    //   console.log('Created', creationDate);
    //   if (
    //     parsedNonce.exp &&
    //     moment.utc().diff(creationDate, 'seconds') > +parsedNonce.exp
    //   )
    //     return {
    //       result: false,
    //       error: 'Sinature has expired',
    //     };
    // }

    const result = pocketnet.authorization.signature({
      address,
      nonce,
      pubkey,
      signature,
      v,
    });

    return result;
  },
};
