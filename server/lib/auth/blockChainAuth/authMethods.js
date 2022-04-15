const pocketnet = require('./pocketnet.js');
const moment = require('moment');

module.exports = {
  default: (authorisationKeys = {}) =>
    pocketnet.authorization.signatureOld(authorisationKeys),

  v1({ address, nonce, pubkey, signature, v } = {}) {
    if (v) {
      const parsedNonce = pocketnet.parsesignature(nonce);

      const creationDate = moment(parsedNonce.date);
      console.log('Created', creationDate);
      if (
        parsedNonce.exp &&
        moment.utc().diff(creationDate, 'seconds') > +parsedNonce.exp
      )
        return {
          result: false,
          error: 'Sinature has expired',
        };
    }

    const result = pocketnet.authorization.signature({
      address,
      nonce,
      pubkey,
      signature,
      v,
    });

    const error = result ? null : 'Invalid user credentials: signature checking failure';

    return { result, error };
  },
};
