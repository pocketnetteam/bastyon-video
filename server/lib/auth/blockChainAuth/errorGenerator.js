module.exports = (message, body = '') => ({
  errors: {
    text: message,
    content: body,
  },
});
