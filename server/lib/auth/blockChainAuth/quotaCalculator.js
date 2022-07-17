const verifiedUsers = require('./verifiedUsers');
const allowedAccounts = require('./testAddresses');

const REQUIRED_REPUTATION = 100;

const REQUIRED_COINS_MIN = 500000000;
const REQUIRED_COINS_MEDIUM = 5000000000;

const QUOTA_DICTIONARY = {
  unTrialUser: 2000000000,
  verifiedUser: 25000000000,
  allowedUser: 500000000,
  fiftyCoinUser: 5000000000,
};

module.exports = (userData = {}) => {
  if (
    verifiedUsers.includes(userData.address) ||
    allowedAccounts.includes(userData.address)
  )
    return QUOTA_DICTIONARY.verifiedUser;

  if (userData.balance >= REQUIRED_COINS_MEDIUM)
    return QUOTA_DICTIONARY.fiftyCoinUser;

  if (userData.trial === false) return QUOTA_DICTIONARY.unTrialUser;

  if (
    userData.balance >= REQUIRED_COINS_MIN ||
    userData.reputation >= REQUIRED_REPUTATION
  )
    return QUOTA_DICTIONARY.allowedUser;

  return 0;
};
