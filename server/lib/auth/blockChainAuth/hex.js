function hexEncode(text) {
  var ch = 0;
  var result = '';

  for (var i = 0; i < text.length; i++) {
    ch = text.charCodeAt(i);
    if (ch > 0xff) ch -= 0x350;
    ch = ch.toString(16);

    while (ch.length < 2) {
      ch = '0' + ch;
    }

    result += ch;
  }

  return result;
}

function hexDecode(hex) {
  var ch = 0;
  var result = '';
  hex = hex.trim();

  for (var i = 2; i <= hex.length; i += 2) {
    ch = parseInt(hex.substring(i - 2, i), 16);
    if (ch >= 128) ch += 0x350;
    ch = String.fromCharCode('0x' + ch.toString(16));
    result += ch;
  }

  return result;
}

module.exports = { hexEncode, hexDecode };
