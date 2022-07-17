const authMethods = require('./authMethods');

const TEST_ADDRESS = 'PJbuz1kue6rc8xMpR9BnQbmJgG2mkdXKL2';

console.log(authMethods.v1({
    address: TEST_ADDRESS,
}));