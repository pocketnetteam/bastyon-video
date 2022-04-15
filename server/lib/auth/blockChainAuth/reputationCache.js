const DAY_TIME = 1000 * 60 * 60 * 24;
const MINUTE_TIME = 1000 * 60;

class ReputationStorageController {
  constructor(storedTime) {
    this.storedTime = storedTime;
    this.reputationStorage = {};
  }

  set(address, reputation) {
    this.reputationStorage[address] = {
      value: reputation,
      date: new Date(),
    };
  }

  remove(address) {
    delete this.reputationStorage[address];
  }

  check(address) {
    const { reputationStorage, storedTime } = this;

    if (!reputationStorage[address]) return false;

    const dateDifference =
      (new Date() - reputationStorage[address].date) / MINUTE_TIME;

    if (dateDifference > storedTime) {
      this.remove(address);
      return false;
    }

    return !reputationStorage[address].value;
  }
}

module.exports = ReputationStorageController;
