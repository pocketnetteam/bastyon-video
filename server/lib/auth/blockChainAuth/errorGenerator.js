module.exports = (message) => ({
  errors: {
    [message]: {
      msg: message,
    },
  },
});
