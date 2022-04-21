module.exports = (message, name = 'UNSPECIFIED_ERROR', body = '') => ({
  errors: {
    name,
    text: message,
    content: body,
  },
});
