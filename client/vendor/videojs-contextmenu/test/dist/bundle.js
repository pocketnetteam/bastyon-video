/*! @name @peertube/videojs-contextmenu @version 5.5.0 @license Apache-2.0 */
(function (QUnit,sinon,videojs) {
	'use strict';

	QUnit = QUnit && QUnit.hasOwnProperty('default') ? QUnit['default'] : QUnit;
	sinon = sinon && sinon.hasOwnProperty('default') ? sinon['default'] : sinon;
	videojs = videojs && videojs.hasOwnProperty('default') ? videojs['default'] : videojs;

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	var minDoc = {};

	var topLevel = typeof commonjsGlobal !== 'undefined' ? commonjsGlobal :
	    typeof window !== 'undefined' ? window : {};


	var doccy;

	if (typeof document !== 'undefined') {
	    doccy = document;
	} else {
	    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

	    if (!doccy) {
	        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
	    }
	}

	var document_1 = doccy;

	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return self;
	}

	var win;

	if (typeof window !== "undefined") {
	    win = window;
	} else if (typeof commonjsGlobal !== "undefined") {
	    win = commonjsGlobal;
	} else if (typeof self !== "undefined"){
	    win = self;
	} else {
	    win = {};
	}

	var window_1 = win;

	var cov_457s6abpn = function () {
	  var path = '/home/florian/Coding/NodeJS/videojs-contextmenu/src/context-menu-item.js',
	      hash = '9fe5e0da72e56b5e7c020c3dd73c6955ff365007',
	      Function = function () {}.constructor,
	      global = new Function('return this')(),
	      gcv = '__coverage__',
	      coverageData = {
	    path: '/home/florian/Coding/NodeJS/videojs-contextmenu/src/context-menu-item.js',
	    statementMap: {
	      '0': {
	        start: {
	          line: 4,
	          column: 17
	        },
	        end: {
	          line: 4,
	          column: 49
	        }
	      },
	      '1': {
	        start: {
	          line: 9,
	          column: 4
	        },
	        end: {
	          line: 9,
	          column: 24
	        }
	      },
	      '2': {
	        start: {
	          line: 10,
	          column: 4
	        },
	        end: {
	          line: 10,
	          column: 29
	        }
	      },
	      '3': {
	        start: {
	          line: 13,
	          column: 4
	        },
	        end: {
	          line: 15,
	          column: 10
	        }
	      },
	      '4': {
	        start: {
	          line: 14,
	          column: 6
	        },
	        end: {
	          line: 14,
	          column: 49
	        }
	      },
	      '5': {
	        start: {
	          line: 19,
	          column: 15
	        },
	        end: {
	          line: 19,
	          column: 49
	        }
	      },
	      '6': {
	        start: {
	          line: 21,
	          column: 18
	        },
	        end: {
	          line: 21,
	          column: 46
	        }
	      },
	      '7': {
	        start: {
	          line: 23,
	          column: 4
	        },
	        end: {
	          line: 23,
	          column: 102
	        }
	      },
	      '8': {
	        start: {
	          line: 25,
	          column: 4
	        },
	        end: {
	          line: 25,
	          column: 68
	        }
	      },
	      '9': {
	        start: {
	          line: 27,
	          column: 4
	        },
	        end: {
	          line: 27,
	          column: 14
	        }
	      }
	    },
	    fnMap: {
	      '0': {
	        name: '(anonymous_0)',
	        decl: {
	          start: {
	            line: 8,
	            column: 2
	          },
	          end: {
	            line: 8,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 8,
	            column: 17
	          },
	          end: {
	            line: 16,
	            column: 3
	          }
	        },
	        line: 8
	      },
	      '1': {
	        name: '(anonymous_1)',
	        decl: {
	          start: {
	            line: 13,
	            column: 22
	          },
	          end: {
	            line: 13,
	            column: 23
	          }
	        },
	        loc: {
	          start: {
	            line: 13,
	            column: 28
	          },
	          end: {
	            line: 15,
	            column: 5
	          }
	        },
	        line: 13
	      },
	      '2': {
	        name: '(anonymous_2)',
	        decl: {
	          start: {
	            line: 18,
	            column: 2
	          },
	          end: {
	            line: 18,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 18,
	            column: 31
	          },
	          end: {
	            line: 28,
	            column: 3
	          }
	        },
	        line: 18
	      }
	    },
	    branchMap: {},
	    s: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0
	    },
	    f: {
	      '0': 0,
	      '1': 0,
	      '2': 0
	    },
	    b: {},
	    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
	  },
	      coverage = global[gcv] || (global[gcv] = {});

	  if (coverage[path] && coverage[path].hash === hash) {
	    return coverage[path];
	  }

	  coverageData.hash = hash;
	  return coverage[path] = coverageData;
	}();
	var MenuItem = (cov_457s6abpn.s[0]++, videojs.getComponent('MenuItem'));

	var ContextMenuItem =
	/*#__PURE__*/
	function (_MenuItem) {
	  _inheritsLoose(ContextMenuItem, _MenuItem);

	  function ContextMenuItem() {
	    return _MenuItem.apply(this, arguments) || this;
	  }

	  var _proto = ContextMenuItem.prototype;

	  _proto.handleClick = function handleClick(e) {
	    var _this = this;

	    cov_457s6abpn.f[0]++;
	    cov_457s6abpn.s[1]++;

	    _MenuItem.prototype.handleClick.call(this);

	    cov_457s6abpn.s[2]++;
	    this.options_.listener();
	    cov_457s6abpn.s[3]++;
	    window_1.setTimeout(function () {
	      cov_457s6abpn.f[1]++;
	      cov_457s6abpn.s[4]++;

	      _this.player().contextmenuUI.menu.dispose();
	    }, 1);
	  };

	  _proto.createEl = function createEl(type, props, attrs) {
	    cov_457s6abpn.f[2]++;
	    var el = (cov_457s6abpn.s[5]++, _MenuItem.prototype.createEl.call(this, type, props, attrs));
	    var newEl = (cov_457s6abpn.s[6]++, videojs.dom.createEl('span'));
	    cov_457s6abpn.s[7]++;
	    newEl.innerHTML = "<span class=\"vjs-menu-item-text\">" + this.localize(this.options_.label) + "</span>";
	    cov_457s6abpn.s[8]++;
	    el.replaceChild(newEl, el.querySelector('.vjs-menu-item-text'));
	    cov_457s6abpn.s[9]++;
	    return el;
	  };

	  return ContextMenuItem;
	}(MenuItem);

	var cov_2a0n1hineo = function () {
	  var path = '/home/florian/Coding/NodeJS/videojs-contextmenu/src/context-menu.js',
	      hash = 'db54421e9d0c974f2d736d6432b8d9c359b80cb2',
	      Function = function () {}.constructor,
	      global = new Function('return this')(),
	      gcv = '__coverage__',
	      coverageData = {
	    path: '/home/florian/Coding/NodeJS/videojs-contextmenu/src/context-menu.js',
	    statementMap: {
	      '0': {
	        start: {
	          line: 5,
	          column: 13
	        },
	        end: {
	          line: 5,
	          column: 41
	        }
	      },
	      '1': {
	        start: {
	          line: 7,
	          column: 12
	        },
	        end: {
	          line: 7,
	          column: 34
	        }
	      },
	      '2': {
	        start: {
	          line: 12,
	          column: 4
	        },
	        end: {
	          line: 12,
	          column: 27
	        }
	      },
	      '3': {
	        start: {
	          line: 16,
	          column: 4
	        },
	        end: {
	          line: 16,
	          column: 52
	        }
	      },
	      '4': {
	        start: {
	          line: 18,
	          column: 4
	        },
	        end: {
	          line: 31,
	          column: 7
	        }
	      },
	      '5': {
	        start: {
	          line: 19,
	          column: 15
	        },
	        end: {
	          line: 19,
	          column: 28
	        }
	      },
	      '6': {
	        start: {
	          line: 21,
	          column: 6
	        },
	        end: {
	          line: 25,
	          column: 7
	        }
	      },
	      '7': {
	        start: {
	          line: 22,
	          column: 8
	        },
	        end: {
	          line: 22,
	          column: 24
	        }
	      },
	      '8': {
	        start: {
	          line: 23,
	          column: 13
	        },
	        end: {
	          line: 25,
	          column: 7
	        }
	      },
	      '9': {
	        start: {
	          line: 24,
	          column: 8
	        },
	        end: {
	          line: 24,
	          column: 39
	        }
	      },
	      '10': {
	        start: {
	          line: 24,
	          column: 19
	        },
	        end: {
	          line: 24,
	          column: 38
	        }
	      },
	      '11': {
	        start: {
	          line: 27,
	          column: 6
	        },
	        end: {
	          line: 30,
	          column: 10
	        }
	      },
	      '12': {
	        start: {
	          line: 35,
	          column: 15
	        },
	        end: {
	          line: 35,
	          column: 31
	        }
	      },
	      '13': {
	        start: {
	          line: 37,
	          column: 4
	        },
	        end: {
	          line: 37,
	          column: 48
	        }
	      },
	      '14': {
	        start: {
	          line: 38,
	          column: 4
	        },
	        end: {
	          line: 38,
	          column: 55
	        }
	      },
	      '15': {
	        start: {
	          line: 39,
	          column: 4
	        },
	        end: {
	          line: 39,
	          column: 53
	        }
	      },
	      '16': {
	        start: {
	          line: 41,
	          column: 4
	        },
	        end: {
	          line: 41,
	          column: 14
	        }
	      }
	    },
	    fnMap: {
	      '0': {
	        name: '(anonymous_0)',
	        decl: {
	          start: {
	            line: 11,
	            column: 2
	          },
	          end: {
	            line: 11,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 11,
	            column: 31
	          },
	          end: {
	            line: 32,
	            column: 3
	          }
	        },
	        line: 11
	      },
	      '1': {
	        name: '(anonymous_1)',
	        decl: {
	          start: {
	            line: 18,
	            column: 28
	          },
	          end: {
	            line: 18,
	            column: 29
	          }
	        },
	        loc: {
	          start: {
	            line: 18,
	            column: 33
	          },
	          end: {
	            line: 31,
	            column: 5
	          }
	        },
	        line: 18
	      },
	      '2': {
	        name: '(anonymous_2)',
	        decl: {
	          start: {
	            line: 19,
	            column: 15
	          },
	          end: {
	            line: 19,
	            column: 16
	          }
	        },
	        loc: {
	          start: {
	            line: 19,
	            column: 26
	          },
	          end: {
	            line: 19,
	            column: 28
	          }
	        },
	        line: 19
	      },
	      '3': {
	        name: '(anonymous_3)',
	        decl: {
	          start: {
	            line: 24,
	            column: 13
	          },
	          end: {
	            line: 24,
	            column: 14
	          }
	        },
	        loc: {
	          start: {
	            line: 24,
	            column: 19
	          },
	          end: {
	            line: 24,
	            column: 38
	          }
	        },
	        line: 24
	      },
	      '4': {
	        name: '(anonymous_4)',
	        decl: {
	          start: {
	            line: 34,
	            column: 2
	          },
	          end: {
	            line: 34,
	            column: 3
	          }
	        },
	        loc: {
	          start: {
	            line: 34,
	            column: 13
	          },
	          end: {
	            line: 42,
	            column: 3
	          }
	        },
	        line: 34
	      }
	    },
	    branchMap: {
	      '0': {
	        loc: {
	          start: {
	            line: 7,
	            column: 12
	          },
	          end: {
	            line: 7,
	            column: 34
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 7,
	            column: 12
	          },
	          end: {
	            line: 7,
	            column: 23
	          }
	        }, {
	          start: {
	            line: 7,
	            column: 27
	          },
	          end: {
	            line: 7,
	            column: 34
	          }
	        }],
	        line: 7
	      },
	      '1': {
	        loc: {
	          start: {
	            line: 21,
	            column: 6
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 21,
	            column: 6
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 21,
	            column: 6
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        }],
	        line: 21
	      },
	      '2': {
	        loc: {
	          start: {
	            line: 23,
	            column: 13
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 23,
	            column: 13
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        }, {
	          start: {
	            line: 23,
	            column: 13
	          },
	          end: {
	            line: 25,
	            column: 7
	          }
	        }],
	        line: 23
	      }
	    },
	    s: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0,
	      '10': 0,
	      '11': 0,
	      '12': 0,
	      '13': 0,
	      '14': 0,
	      '15': 0,
	      '16': 0
	    },
	    f: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0
	    },
	    b: {
	      '0': [0, 0],
	      '1': [0, 0],
	      '2': [0, 0]
	    },
	    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
	  },
	      coverage = global[gcv] || (global[gcv] = {});

	  if (coverage[path] && coverage[path].hash === hash) {
	    return coverage[path];
	  }

	  coverageData.hash = hash;
	  return coverage[path] = coverageData;
	}();
	var Menu = (cov_2a0n1hineo.s[0]++, videojs.getComponent('Menu'));
	var dom = (cov_2a0n1hineo.s[1]++, (cov_2a0n1hineo.b[0][0]++, videojs.dom) || (cov_2a0n1hineo.b[0][1]++, videojs));

	var ContextMenu =
	/*#__PURE__*/
	function (_Menu) {
	  _inheritsLoose(ContextMenu, _Menu);

	  function ContextMenu(player, options) {
	    var _this;

	    cov_2a0n1hineo.f[0]++;
	    cov_2a0n1hineo.s[2]++;
	    _this = _Menu.call(this, player, options) || this;
	    cov_2a0n1hineo.s[3]++;
	    _this.dispose = videojs.bind(_assertThisInitialized(_this), _this.dispose);
	    cov_2a0n1hineo.s[4]++;
	    options.content.forEach(function (c) {
	      cov_2a0n1hineo.f[1]++;
	      cov_2a0n1hineo.s[5]++;

	      var fn = function fn() {
	        cov_2a0n1hineo.f[2]++;
	      };

	      cov_2a0n1hineo.s[6]++;

	      if (typeof c.listener === 'function') {
	        cov_2a0n1hineo.b[1][0]++;
	        cov_2a0n1hineo.s[7]++;
	        fn = c.listener;
	      } else {
	        cov_2a0n1hineo.b[1][1]++;
	        cov_2a0n1hineo.s[8]++;

	        if (typeof c.href === 'string') {
	          cov_2a0n1hineo.b[2][0]++;
	          cov_2a0n1hineo.s[9]++;

	          fn = function fn() {
	            cov_2a0n1hineo.f[3]++;
	            cov_2a0n1hineo.s[10]++;
	            return window_1.open(c.href);
	          };
	        } else {
	          cov_2a0n1hineo.b[2][1]++;
	        }
	      }

	      cov_2a0n1hineo.s[11]++;

	      _this.addItem(new ContextMenuItem(player, {
	        label: c.label,
	        listener: videojs.bind(player, fn)
	      }));
	    });
	    return _this;
	  }

	  var _proto = ContextMenu.prototype;

	  _proto.createEl = function createEl() {
	    cov_2a0n1hineo.f[4]++;
	    var el = (cov_2a0n1hineo.s[12]++, _Menu.prototype.createEl.call(this));
	    cov_2a0n1hineo.s[13]++;
	    dom.addClass(el, 'vjs-contextmenu-ui-menu');
	    cov_2a0n1hineo.s[14]++;
	    el.style.left = this.options_.position.left + 'px';
	    cov_2a0n1hineo.s[15]++;
	    el.style.top = this.options_.position.top + 'px';
	    cov_2a0n1hineo.s[16]++;
	    return el;
	  };

	  return ContextMenu;
	}(Menu);

	var cov_zelxpv0sy = function () {
	  var path = '/home/florian/Coding/NodeJS/videojs-contextmenu/src/util.js',
	      hash = '202d7d9dab9bab42aa699c977d349d93b87f23b5',
	      Function = function () {}.constructor,
	      global = new Function('return this')(),
	      gcv = '__coverage__',
	      coverageData = {
	    path: '/home/florian/Coding/NodeJS/videojs-contextmenu/src/util.js',
	    statementMap: {
	      '0': {
	        start: {
	          line: 18,
	          column: 2
	        },
	        end: {
	          line: 20,
	          column: 3
	        }
	      },
	      '1': {
	        start: {
	          line: 19,
	          column: 4
	        },
	        end: {
	          line: 19,
	          column: 37
	        }
	      },
	      '2': {
	        start: {
	          line: 22,
	          column: 2
	        },
	        end: {
	          line: 27,
	          column: 3
	        }
	      },
	      '3': {
	        start: {
	          line: 23,
	          column: 4
	        },
	        end: {
	          line: 26,
	          column: 6
	        }
	      },
	      '4': {
	        start: {
	          line: 29,
	          column: 16
	        },
	        end: {
	          line: 29,
	          column: 40
	        }
	      },
	      '5': {
	        start: {
	          line: 30,
	          column: 15
	        },
	        end: {
	          line: 30,
	          column: 28
	        }
	      },
	      '6': {
	        start: {
	          line: 32,
	          column: 21
	        },
	        end: {
	          line: 32,
	          column: 61
	        }
	      },
	      '7': {
	        start: {
	          line: 33,
	          column: 21
	        },
	        end: {
	          line: 33,
	          column: 58
	        }
	      },
	      '8': {
	        start: {
	          line: 34,
	          column: 15
	        },
	        end: {
	          line: 34,
	          column: 49
	        }
	      },
	      '9': {
	        start: {
	          line: 36,
	          column: 20
	        },
	        end: {
	          line: 36,
	          column: 58
	        }
	      },
	      '10': {
	        start: {
	          line: 37,
	          column: 20
	        },
	        end: {
	          line: 37,
	          column: 56
	        }
	      },
	      '11': {
	        start: {
	          line: 38,
	          column: 14
	        },
	        end: {
	          line: 38,
	          column: 45
	        }
	      },
	      '12': {
	        start: {
	          line: 41,
	          column: 2
	        },
	        end: {
	          line: 44,
	          column: 4
	        }
	      },
	      '13': {
	        start: {
	          line: 60,
	          column: 19
	        },
	        end: {
	          line: 60,
	          column: 21
	        }
	      },
	      '14': {
	        start: {
	          line: 61,
	          column: 14
	        },
	        end: {
	          line: 61,
	          column: 32
	        }
	      },
	      '15': {
	        start: {
	          line: 62,
	          column: 15
	        },
	        end: {
	          line: 62,
	          column: 29
	        }
	      },
	      '16': {
	        start: {
	          line: 63,
	          column: 15
	        },
	        end: {
	          line: 63,
	          column: 30
	        }
	      },
	      '17': {
	        start: {
	          line: 64,
	          column: 15
	        },
	        end: {
	          line: 64,
	          column: 22
	        }
	      },
	      '18': {
	        start: {
	          line: 65,
	          column: 15
	        },
	        end: {
	          line: 65,
	          column: 23
	        }
	      },
	      '19': {
	        start: {
	          line: 66,
	          column: 14
	        },
	        end: {
	          line: 66,
	          column: 25
	        }
	      },
	      '20': {
	        start: {
	          line: 67,
	          column: 14
	        },
	        end: {
	          line: 67,
	          column: 25
	        }
	      },
	      '21': {
	        start: {
	          line: 69,
	          column: 2
	        },
	        end: {
	          line: 72,
	          column: 3
	        }
	      },
	      '22': {
	        start: {
	          line: 70,
	          column: 4
	        },
	        end: {
	          line: 70,
	          column: 42
	        }
	      },
	      '23': {
	        start: {
	          line: 71,
	          column: 4
	        },
	        end: {
	          line: 71,
	          column: 42
	        }
	      },
	      '24': {
	        start: {
	          line: 74,
	          column: 2
	        },
	        end: {
	          line: 74,
	          column: 72
	        }
	      },
	      '25': {
	        start: {
	          line: 75,
	          column: 2
	        },
	        end: {
	          line: 75,
	          column: 63
	        }
	      },
	      '26': {
	        start: {
	          line: 77,
	          column: 2
	        },
	        end: {
	          line: 77,
	          column: 18
	        }
	      },
	      '27': {
	        start: {
	          line: 81,
	          column: 2
	        },
	        end: {
	          line: 81,
	          column: 86
	        }
	      }
	    },
	    fnMap: {
	      '0': {
	        name: 'findElPosition',
	        decl: {
	          start: {
	            line: 15,
	            column: 16
	          },
	          end: {
	            line: 15,
	            column: 30
	          }
	        },
	        loc: {
	          start: {
	            line: 15,
	            column: 35
	          },
	          end: {
	            line: 45,
	            column: 1
	          }
	        },
	        line: 15
	      },
	      '1': {
	        name: 'getPointerPosition',
	        decl: {
	          start: {
	            line: 59,
	            column: 16
	          },
	          end: {
	            line: 59,
	            column: 34
	          }
	        },
	        loc: {
	          start: {
	            line: 59,
	            column: 46
	          },
	          end: {
	            line: 78,
	            column: 1
	          }
	        },
	        line: 59
	      },
	      '2': {
	        name: 'isFunction',
	        decl: {
	          start: {
	            line: 80,
	            column: 16
	          },
	          end: {
	            line: 80,
	            column: 26
	          }
	        },
	        loc: {
	          start: {
	            line: 80,
	            column: 44
	          },
	          end: {
	            line: 82,
	            column: 1
	          }
	        },
	        line: 80
	      }
	    },
	    branchMap: {
	      '0': {
	        loc: {
	          start: {
	            line: 18,
	            column: 2
	          },
	          end: {
	            line: 20,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 18,
	            column: 2
	          },
	          end: {
	            line: 20,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 18,
	            column: 2
	          },
	          end: {
	            line: 20,
	            column: 3
	          }
	        }],
	        line: 18
	      },
	      '1': {
	        loc: {
	          start: {
	            line: 18,
	            column: 6
	          },
	          end: {
	            line: 18,
	            column: 47
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 18,
	            column: 6
	          },
	          end: {
	            line: 18,
	            column: 30
	          }
	        }, {
	          start: {
	            line: 18,
	            column: 34
	          },
	          end: {
	            line: 18,
	            column: 47
	          }
	        }],
	        line: 18
	      },
	      '2': {
	        loc: {
	          start: {
	            line: 22,
	            column: 2
	          },
	          end: {
	            line: 27,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 22,
	            column: 2
	          },
	          end: {
	            line: 27,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 22,
	            column: 2
	          },
	          end: {
	            line: 27,
	            column: 3
	          }
	        }],
	        line: 22
	      },
	      '3': {
	        loc: {
	          start: {
	            line: 32,
	            column: 21
	          },
	          end: {
	            line: 32,
	            column: 61
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 32,
	            column: 21
	          },
	          end: {
	            line: 32,
	            column: 37
	          }
	        }, {
	          start: {
	            line: 32,
	            column: 41
	          },
	          end: {
	            line: 32,
	            column: 56
	          }
	        }, {
	          start: {
	            line: 32,
	            column: 60
	          },
	          end: {
	            line: 32,
	            column: 61
	          }
	        }],
	        line: 32
	      },
	      '4': {
	        loc: {
	          start: {
	            line: 33,
	            column: 21
	          },
	          end: {
	            line: 33,
	            column: 58
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 33,
	            column: 21
	          },
	          end: {
	            line: 33,
	            column: 39
	          }
	        }, {
	          start: {
	            line: 33,
	            column: 43
	          },
	          end: {
	            line: 33,
	            column: 58
	          }
	        }],
	        line: 33
	      },
	      '5': {
	        loc: {
	          start: {
	            line: 36,
	            column: 20
	          },
	          end: {
	            line: 36,
	            column: 58
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 36,
	            column: 20
	          },
	          end: {
	            line: 36,
	            column: 35
	          }
	        }, {
	          start: {
	            line: 36,
	            column: 39
	          },
	          end: {
	            line: 36,
	            column: 53
	          }
	        }, {
	          start: {
	            line: 36,
	            column: 57
	          },
	          end: {
	            line: 36,
	            column: 58
	          }
	        }],
	        line: 36
	      },
	      '6': {
	        loc: {
	          start: {
	            line: 37,
	            column: 20
	          },
	          end: {
	            line: 37,
	            column: 56
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 37,
	            column: 20
	          },
	          end: {
	            line: 37,
	            column: 38
	          }
	        }, {
	          start: {
	            line: 37,
	            column: 42
	          },
	          end: {
	            line: 37,
	            column: 56
	          }
	        }],
	        line: 37
	      },
	      '7': {
	        loc: {
	          start: {
	            line: 69,
	            column: 2
	          },
	          end: {
	            line: 72,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 69,
	            column: 2
	          },
	          end: {
	            line: 72,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 69,
	            column: 2
	          },
	          end: {
	            line: 72,
	            column: 3
	          }
	        }],
	        line: 69
	      },
	      '8': {
	        loc: {
	          start: {
	            line: 81,
	            column: 9
	          },
	          end: {
	            line: 81,
	            column: 85
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 81,
	            column: 9
	          },
	          end: {
	            line: 81,
	            column: 24
	          }
	        }, {
	          start: {
	            line: 81,
	            column: 28
	          },
	          end: {
	            line: 81,
	            column: 85
	          }
	        }],
	        line: 81
	      }
	    },
	    s: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0,
	      '10': 0,
	      '11': 0,
	      '12': 0,
	      '13': 0,
	      '14': 0,
	      '15': 0,
	      '16': 0,
	      '17': 0,
	      '18': 0,
	      '19': 0,
	      '20': 0,
	      '21': 0,
	      '22': 0,
	      '23': 0,
	      '24': 0,
	      '25': 0,
	      '26': 0,
	      '27': 0
	    },
	    f: {
	      '0': 0,
	      '1': 0,
	      '2': 0
	    },
	    b: {
	      '0': [0, 0],
	      '1': [0, 0],
	      '2': [0, 0],
	      '3': [0, 0, 0],
	      '4': [0, 0],
	      '5': [0, 0, 0],
	      '6': [0, 0],
	      '7': [0, 0],
	      '8': [0, 0]
	    },
	    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
	  },
	      coverage = global[gcv] || (global[gcv] = {});

	  if (coverage[path] && coverage[path].hash === hash) {
	    return coverage[path];
	  }

	  coverageData.hash = hash;
	  return coverage[path] = coverageData;
	}();
	function findElPosition(el) {
	  cov_zelxpv0sy.f[0]++;
	  var box;
	  cov_zelxpv0sy.s[0]++;

	  if ((cov_zelxpv0sy.b[1][0]++, el.getBoundingClientRect) && (cov_zelxpv0sy.b[1][1]++, el.parentNode)) {
	    cov_zelxpv0sy.b[0][0]++;
	    cov_zelxpv0sy.s[1]++;
	    box = el.getBoundingClientRect();
	  } else {
	    cov_zelxpv0sy.b[0][1]++;
	  }

	  cov_zelxpv0sy.s[2]++;

	  if (!box) {
	    cov_zelxpv0sy.b[2][0]++;
	    cov_zelxpv0sy.s[3]++;
	    return {
	      left: 0,
	      top: 0
	    };
	  } else {
	    cov_zelxpv0sy.b[2][1]++;
	  }

	  var docEl = (cov_zelxpv0sy.s[4]++, document_1.documentElement);
	  var body = (cov_zelxpv0sy.s[5]++, document_1.body);
	  var clientLeft = (cov_zelxpv0sy.s[6]++, (cov_zelxpv0sy.b[3][0]++, docEl.clientLeft) || (cov_zelxpv0sy.b[3][1]++, body.clientLeft) || (cov_zelxpv0sy.b[3][2]++, 0));
	  var scrollLeft = (cov_zelxpv0sy.s[7]++, (cov_zelxpv0sy.b[4][0]++, window_1.pageXOffset) || (cov_zelxpv0sy.b[4][1]++, body.scrollLeft));
	  var left = (cov_zelxpv0sy.s[8]++, box.left + scrollLeft - clientLeft);
	  var clientTop = (cov_zelxpv0sy.s[9]++, (cov_zelxpv0sy.b[5][0]++, docEl.clientTop) || (cov_zelxpv0sy.b[5][1]++, body.clientTop) || (cov_zelxpv0sy.b[5][2]++, 0));
	  var scrollTop = (cov_zelxpv0sy.s[10]++, (cov_zelxpv0sy.b[6][0]++, window_1.pageYOffset) || (cov_zelxpv0sy.b[6][1]++, body.scrollTop));
	  var top = (cov_zelxpv0sy.s[11]++, box.top + scrollTop - clientTop);
	  cov_zelxpv0sy.s[12]++;
	  return {
	    left: Math.round(left),
	    top: Math.round(top)
	  };
	}
	function getPointerPosition(el, event) {
	  cov_zelxpv0sy.f[1]++;
	  var position = (cov_zelxpv0sy.s[13]++, {});
	  var box = (cov_zelxpv0sy.s[14]++, findElPosition(el));
	  var boxW = (cov_zelxpv0sy.s[15]++, el.offsetWidth);
	  var boxH = (cov_zelxpv0sy.s[16]++, el.offsetHeight);
	  var boxY = (cov_zelxpv0sy.s[17]++, box.top);
	  var boxX = (cov_zelxpv0sy.s[18]++, box.left);
	  var pageY = (cov_zelxpv0sy.s[19]++, event.pageY);
	  var pageX = (cov_zelxpv0sy.s[20]++, event.pageX);
	  cov_zelxpv0sy.s[21]++;

	  if (event.changedTouches) {
	    cov_zelxpv0sy.b[7][0]++;
	    cov_zelxpv0sy.s[22]++;
	    pageX = event.changedTouches[0].pageX;
	    cov_zelxpv0sy.s[23]++;
	    pageY = event.changedTouches[0].pageY;
	  } else {
	    cov_zelxpv0sy.b[7][1]++;
	  }

	  cov_zelxpv0sy.s[24]++;
	  position.y = Math.max(0, Math.min(1, (boxY - pageY + boxH) / boxH));
	  cov_zelxpv0sy.s[25]++;
	  position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW));
	  cov_zelxpv0sy.s[26]++;
	  return position;
	}
	function isFunction(functionToCheck) {
	  cov_zelxpv0sy.f[2]++;
	  cov_zelxpv0sy.s[27]++;
	  return (cov_zelxpv0sy.b[8][0]++, functionToCheck) && (cov_zelxpv0sy.b[8][1]++, {}.toString.call(functionToCheck) === '[object Function]');
	}

	var version = "5.5.0";

	var cov_1fm34qes6s = function () {
	  var path = '/home/florian/Coding/NodeJS/videojs-contextmenu/src/plugin.js',
	      hash = '3d24e19a6fe38c28c9c17e367da236508f2246bd',
	      Function = function () {}.constructor,
	      global = new Function('return this')(),
	      gcv = '__coverage__',
	      coverageData = {
	    path: '/home/florian/Coding/NodeJS/videojs-contextmenu/src/plugin.js',
	    statementMap: {
	      '0': {
	        start: {
	          line: 14,
	          column: 2
	        },
	        end: {
	          line: 16,
	          column: 35
	        }
	      },
	      '1': {
	        start: {
	          line: 26,
	          column: 18
	        },
	        end: {
	          line: 26,
	          column: 48
	        }
	      },
	      '2': {
	        start: {
	          line: 28,
	          column: 2
	        },
	        end: {
	          line: 28,
	          column: 55
	        }
	      },
	      '3': {
	        start: {
	          line: 40,
	          column: 2
	        },
	        end: {
	          line: 43,
	          column: 4
	        }
	      },
	      '4': {
	        start: {
	          line: 57,
	          column: 2
	        },
	        end: {
	          line: 60,
	          column: 3
	        }
	      },
	      '5': {
	        start: {
	          line: 58,
	          column: 4
	        },
	        end: {
	          line: 58,
	          column: 38
	        }
	      },
	      '6': {
	        start: {
	          line: 59,
	          column: 4
	        },
	        end: {
	          line: 59,
	          column: 11
	        }
	      },
	      '7': {
	        start: {
	          line: 62,
	          column: 2
	        },
	        end: {
	          line: 64,
	          column: 3
	        }
	      },
	      '8': {
	        start: {
	          line: 63,
	          column: 4
	        },
	        end: {
	          line: 63,
	          column: 11
	        }
	      },
	      '9': {
	        start: {
	          line: 68,
	          column: 26
	        },
	        end: {
	          line: 68,
	          column: 58
	        }
	      },
	      '10': {
	        start: {
	          line: 69,
	          column: 21
	        },
	        end: {
	          line: 69,
	          column: 54
	        }
	      },
	      '11': {
	        start: {
	          line: 70,
	          column: 23
	        },
	        end: {
	          line: 70,
	          column: 68
	        }
	      },
	      '12': {
	        start: {
	          line: 73,
	          column: 21
	        },
	        end: {
	          line: 73,
	          column: 85
	        }
	      },
	      '13': {
	        start: {
	          line: 75,
	          column: 2
	        },
	        end: {
	          line: 75,
	          column: 21
	        }
	      },
	      '14': {
	        start: {
	          line: 77,
	          column: 15
	        },
	        end: {
	          line: 80,
	          column: 4
	        }
	      },
	      '15': {
	        start: {
	          line: 84,
	          column: 2
	        },
	        end: {
	          line: 87,
	          column: 4
	        }
	      },
	      '16': {
	        start: {
	          line: 85,
	          column: 4
	        },
	        end: {
	          line: 85,
	          column: 128
	        }
	      },
	      '17': {
	        start: {
	          line: 86,
	          column: 4
	        },
	        end: {
	          line: 86,
	          column: 19
	        }
	      },
	      '18': {
	        start: {
	          line: 89,
	          column: 2
	        },
	        end: {
	          line: 93,
	          column: 5
	        }
	      },
	      '19': {
	        start: {
	          line: 90,
	          column: 4
	        },
	        end: {
	          line: 90,
	          column: 60
	        }
	      },
	      '20': {
	        start: {
	          line: 91,
	          column: 4
	        },
	        end: {
	          line: 91,
	          column: 27
	        }
	      },
	      '21': {
	        start: {
	          line: 92,
	          column: 4
	        },
	        end: {
	          line: 92,
	          column: 35
	        }
	      },
	      '22': {
	        start: {
	          line: 95,
	          column: 2
	        },
	        end: {
	          line: 95,
	          column: 22
	        }
	      },
	      '23': {
	        start: {
	          line: 97,
	          column: 19
	        },
	        end: {
	          line: 97,
	          column: 51
	        }
	      },
	      '24': {
	        start: {
	          line: 98,
	          column: 19
	        },
	        end: {
	          line: 98,
	          column: 56
	        }
	      },
	      '25': {
	        start: {
	          line: 100,
	          column: 2
	        },
	        end: {
	          line: 111,
	          column: 3
	        }
	      },
	      '26': {
	        start: {
	          line: 103,
	          column: 4
	        },
	        end: {
	          line: 106,
	          column: 14
	        }
	      },
	      '27': {
	        start: {
	          line: 107,
	          column: 4
	        },
	        end: {
	          line: 110,
	          column: 14
	        }
	      },
	      '28': {
	        start: {
	          line: 113,
	          column: 2
	        },
	        end: {
	          line: 113,
	          column: 57
	        }
	      },
	      '29': {
	        start: {
	          line: 129,
	          column: 19
	        },
	        end: {
	          line: 132,
	          column: 3
	        }
	      },
	      '30': {
	        start: {
	          line: 134,
	          column: 2
	        },
	        end: {
	          line: 134,
	          column: 52
	        }
	      },
	      '31': {
	        start: {
	          line: 136,
	          column: 2
	        },
	        end: {
	          line: 138,
	          column: 3
	        }
	      },
	      '32': {
	        start: {
	          line: 137,
	          column: 4
	        },
	        end: {
	          line: 137,
	          column: 42
	        }
	      },
	      '33': {
	        start: {
	          line: 141,
	          column: 2
	        },
	        end: {
	          line: 148,
	          column: 3
	        }
	      },
	      '34': {
	        start: {
	          line: 142,
	          column: 4
	        },
	        end: {
	          line: 142,
	          column: 38
	        }
	      },
	      '35': {
	        start: {
	          line: 143,
	          column: 4
	        },
	        end: {
	          line: 143,
	          column: 62
	        }
	      },
	      '36': {
	        start: {
	          line: 147,
	          column: 4
	        },
	        end: {
	          line: 147,
	          column: 30
	        }
	      },
	      '37': {
	        start: {
	          line: 153,
	          column: 15
	        },
	        end: {
	          line: 155,
	          column: 3
	        }
	      },
	      '38': {
	        start: {
	          line: 154,
	          column: 4
	        },
	        end: {
	          line: 154,
	          column: 41
	        }
	      },
	      '39': {
	        start: {
	          line: 157,
	          column: 2
	        },
	        end: {
	          line: 157,
	          column: 57
	        }
	      },
	      '40': {
	        start: {
	          line: 158,
	          column: 2
	        },
	        end: {
	          line: 158,
	          column: 33
	        }
	      },
	      '41': {
	        start: {
	          line: 159,
	          column: 2
	        },
	        end: {
	          line: 159,
	          column: 39
	        }
	      },
	      '42': {
	        start: {
	          line: 160,
	          column: 2
	        },
	        end: {
	          line: 160,
	          column: 26
	        }
	      },
	      '43': {
	        start: {
	          line: 161,
	          column: 2
	        },
	        end: {
	          line: 161,
	          column: 25
	        }
	      },
	      '44': {
	        start: {
	          line: 163,
	          column: 2
	        },
	        end: {
	          line: 163,
	          column: 45
	        }
	      },
	      '45': {
	        start: {
	          line: 164,
	          column: 2
	        },
	        end: {
	          line: 164,
	          column: 56
	        }
	      },
	      '46': {
	        start: {
	          line: 164,
	          column: 19
	        },
	        end: {
	          line: 164,
	          column: 54
	        }
	      },
	      '47': {
	        start: {
	          line: 167,
	          column: 0
	        },
	        end: {
	          line: 167,
	          column: 55
	        }
	      },
	      '48': {
	        start: {
	          line: 168,
	          column: 0
	        },
	        end: {
	          line: 168,
	          column: 32
	        }
	      }
	    },
	    fnMap: {
	      '0': {
	        name: 'hasMenu',
	        decl: {
	          start: {
	            line: 13,
	            column: 9
	          },
	          end: {
	            line: 13,
	            column: 16
	          }
	        },
	        loc: {
	          start: {
	            line: 13,
	            column: 25
	          },
	          end: {
	            line: 17,
	            column: 1
	          }
	        },
	        line: 13
	      },
	      '1': {
	        name: 'excludeElements',
	        decl: {
	          start: {
	            line: 25,
	            column: 9
	          },
	          end: {
	            line: 25,
	            column: 24
	          }
	        },
	        loc: {
	          start: {
	            line: 25,
	            column: 35
	          },
	          end: {
	            line: 29,
	            column: 1
	          }
	        },
	        line: 25
	      },
	      '2': {
	        name: 'findMenuPosition',
	        decl: {
	          start: {
	            line: 39,
	            column: 9
	          },
	          end: {
	            line: 39,
	            column: 25
	          }
	        },
	        loc: {
	          start: {
	            line: 39,
	            column: 55
	          },
	          end: {
	            line: 44,
	            column: 1
	          }
	        },
	        line: 39
	      },
	      '3': {
	        name: 'onContextMenu',
	        decl: {
	          start: {
	            line: 51,
	            column: 9
	          },
	          end: {
	            line: 51,
	            column: 22
	          }
	        },
	        loc: {
	          start: {
	            line: 51,
	            column: 26
	          },
	          end: {
	            line: 114,
	            column: 1
	          }
	        },
	        line: 51
	      },
	      '4': {
	        name: '(anonymous_4)',
	        decl: {
	          start: {
	            line: 84,
	            column: 33
	          },
	          end: {
	            line: 84,
	            column: 34
	          }
	        },
	        loc: {
	          start: {
	            line: 84,
	            column: 39
	          },
	          end: {
	            line: 87,
	            column: 3
	          }
	        },
	        line: 84
	      },
	      '5': {
	        name: '(anonymous_5)',
	        decl: {
	          start: {
	            line: 89,
	            column: 21
	          },
	          end: {
	            line: 89,
	            column: 22
	          }
	        },
	        loc: {
	          start: {
	            line: 89,
	            column: 27
	          },
	          end: {
	            line: 93,
	            column: 3
	          }
	        },
	        line: 89
	      },
	      '6': {
	        name: 'contextmenuUI',
	        decl: {
	          start: {
	            line: 128,
	            column: 9
	          },
	          end: {
	            line: 128,
	            column: 22
	          }
	        },
	        loc: {
	          start: {
	            line: 128,
	            column: 32
	          },
	          end: {
	            line: 165,
	            column: 1
	          }
	        },
	        line: 128
	      },
	      '7': {
	        name: '(anonymous_7)',
	        decl: {
	          start: {
	            line: 153,
	            column: 36
	          },
	          end: {
	            line: 153,
	            column: 37
	          }
	        },
	        loc: {
	          start: {
	            line: 153,
	            column: 47
	          },
	          end: {
	            line: 155,
	            column: 3
	          }
	        },
	        line: 153
	      },
	      '8': {
	        name: '(anonymous_8)',
	        decl: {
	          start: {
	            line: 164,
	            column: 13
	          },
	          end: {
	            line: 164,
	            column: 14
	          }
	        },
	        loc: {
	          start: {
	            line: 164,
	            column: 19
	          },
	          end: {
	            line: 164,
	            column: 54
	          }
	        },
	        line: 164
	      }
	    },
	    branchMap: {
	      '0': {
	        loc: {
	          start: {
	            line: 14,
	            column: 9
	          },
	          end: {
	            line: 16,
	            column: 34
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 14,
	            column: 9
	          },
	          end: {
	            line: 14,
	            column: 47
	          }
	        }, {
	          start: {
	            line: 15,
	            column: 4
	          },
	          end: {
	            line: 15,
	            column: 47
	          }
	        }, {
	          start: {
	            line: 16,
	            column: 4
	          },
	          end: {
	            line: 16,
	            column: 34
	          }
	        }],
	        line: 14
	      },
	      '1': {
	        loc: {
	          start: {
	            line: 28,
	            column: 9
	          },
	          end: {
	            line: 28,
	            column: 54
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 28,
	            column: 9
	          },
	          end: {
	            line: 28,
	            column: 28
	          }
	        }, {
	          start: {
	            line: 28,
	            column: 32
	          },
	          end: {
	            line: 28,
	            column: 54
	          }
	        }],
	        line: 28
	      },
	      '2': {
	        loc: {
	          start: {
	            line: 57,
	            column: 2
	          },
	          end: {
	            line: 60,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 57,
	            column: 2
	          },
	          end: {
	            line: 60,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 57,
	            column: 2
	          },
	          end: {
	            line: 60,
	            column: 3
	          }
	        }],
	        line: 57
	      },
	      '3': {
	        loc: {
	          start: {
	            line: 62,
	            column: 2
	          },
	          end: {
	            line: 64,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 62,
	            column: 2
	          },
	          end: {
	            line: 64,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 62,
	            column: 2
	          },
	          end: {
	            line: 64,
	            column: 3
	          }
	        }],
	        line: 62
	      },
	      '4': {
	        loc: {
	          start: {
	            line: 73,
	            column: 21
	          },
	          end: {
	            line: 73,
	            column: 85
	          }
	        },
	        type: 'cond-expr',
	        locations: [{
	          start: {
	            line: 73,
	            column: 50
	          },
	          end: {
	            line: 73,
	            column: 74
	          }
	        }, {
	          start: {
	            line: 73,
	            column: 77
	          },
	          end: {
	            line: 73,
	            column: 85
	          }
	        }],
	        line: 73
	      },
	      '5': {
	        loc: {
	          start: {
	            line: 78,
	            column: 13
	          },
	          end: {
	            line: 78,
	            column: 113
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 78,
	            column: 13
	          },
	          end: {
	            line: 78,
	            column: 51
	          }
	        }, {
	          start: {
	            line: 78,
	            column: 55
	          },
	          end: {
	            line: 78,
	            column: 83
	          }
	        }, {
	          start: {
	            line: 78,
	            column: 87
	          },
	          end: {
	            line: 78,
	            column: 113
	          }
	        }],
	        line: 78
	      },
	      '6': {
	        loc: {
	          start: {
	            line: 100,
	            column: 2
	          },
	          end: {
	            line: 111,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 100,
	            column: 2
	          },
	          end: {
	            line: 111,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 100,
	            column: 2
	          },
	          end: {
	            line: 111,
	            column: 3
	          }
	        }],
	        line: 100
	      },
	      '7': {
	        loc: {
	          start: {
	            line: 100,
	            column: 6
	          },
	          end: {
	            line: 102,
	            column: 39
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 100,
	            column: 6
	          },
	          end: {
	            line: 100,
	            column: 35
	          }
	        }, {
	          start: {
	            line: 101,
	            column: 6
	          },
	          end: {
	            line: 101,
	            column: 37
	          }
	        }, {
	          start: {
	            line: 102,
	            column: 6
	          },
	          end: {
	            line: 102,
	            column: 39
	          }
	        }],
	        line: 100
	      },
	      '8': {
	        loc: {
	          start: {
	            line: 136,
	            column: 2
	          },
	          end: {
	            line: 138,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 136,
	            column: 2
	          },
	          end: {
	            line: 138,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 136,
	            column: 2
	          },
	          end: {
	            line: 138,
	            column: 3
	          }
	        }],
	        line: 136
	      },
	      '9': {
	        loc: {
	          start: {
	            line: 136,
	            column: 6
	          },
	          end: {
	            line: 136,
	            column: 74
	          }
	        },
	        type: 'binary-expr',
	        locations: [{
	          start: {
	            line: 136,
	            column: 6
	          },
	          end: {
	            line: 136,
	            column: 37
	          }
	        }, {
	          start: {
	            line: 136,
	            column: 41
	          },
	          end: {
	            line: 136,
	            column: 74
	          }
	        }],
	        line: 136
	      },
	      '10': {
	        loc: {
	          start: {
	            line: 141,
	            column: 2
	          },
	          end: {
	            line: 148,
	            column: 3
	          }
	        },
	        type: 'if',
	        locations: [{
	          start: {
	            line: 141,
	            column: 2
	          },
	          end: {
	            line: 148,
	            column: 3
	          }
	        }, {
	          start: {
	            line: 141,
	            column: 2
	          },
	          end: {
	            line: 148,
	            column: 3
	          }
	        }],
	        line: 141
	      }
	    },
	    s: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0,
	      '9': 0,
	      '10': 0,
	      '11': 0,
	      '12': 0,
	      '13': 0,
	      '14': 0,
	      '15': 0,
	      '16': 0,
	      '17': 0,
	      '18': 0,
	      '19': 0,
	      '20': 0,
	      '21': 0,
	      '22': 0,
	      '23': 0,
	      '24': 0,
	      '25': 0,
	      '26': 0,
	      '27': 0,
	      '28': 0,
	      '29': 0,
	      '30': 0,
	      '31': 0,
	      '32': 0,
	      '33': 0,
	      '34': 0,
	      '35': 0,
	      '36': 0,
	      '37': 0,
	      '38': 0,
	      '39': 0,
	      '40': 0,
	      '41': 0,
	      '42': 0,
	      '43': 0,
	      '44': 0,
	      '45': 0,
	      '46': 0,
	      '47': 0,
	      '48': 0
	    },
	    f: {
	      '0': 0,
	      '1': 0,
	      '2': 0,
	      '3': 0,
	      '4': 0,
	      '5': 0,
	      '6': 0,
	      '7': 0,
	      '8': 0
	    },
	    b: {
	      '0': [0, 0, 0],
	      '1': [0, 0],
	      '2': [0, 0],
	      '3': [0, 0],
	      '4': [0, 0],
	      '5': [0, 0, 0],
	      '6': [0, 0],
	      '7': [0, 0, 0],
	      '8': [0, 0],
	      '9': [0, 0],
	      '10': [0, 0]
	    },
	    _coverageSchema: '332fd63041d2c1bcb487cc26dd0d5f7d97098a6c'
	  },
	      coverage = global[gcv] || (global[gcv] = {});

	  if (coverage[path] && coverage[path].hash === hash) {
	    return coverage[path];
	  }

	  coverageData.hash = hash;
	  return coverage[path] = coverageData;
	}();

	function hasMenu(player) {
	  cov_1fm34qes6s.f[0]++;
	  cov_1fm34qes6s.s[0]++;
	  return (cov_1fm34qes6s.b[0][0]++, player.hasOwnProperty('contextmenuUI')) && (cov_1fm34qes6s.b[0][1]++, player.contextmenuUI.hasOwnProperty('menu')) && (cov_1fm34qes6s.b[0][2]++, player.contextmenuUI.menu.el());
	}

	function excludeElements(targetEl) {
	  cov_1fm34qes6s.f[1]++;
	  var tagName = (cov_1fm34qes6s.s[1]++, targetEl.tagName.toLowerCase());
	  cov_1fm34qes6s.s[2]++;
	  return (cov_1fm34qes6s.b[1][0]++, tagName === 'input') || (cov_1fm34qes6s.b[1][1]++, tagName === 'textarea');
	}

	function findMenuPosition(pointerPosition, playerSize) {
	  cov_1fm34qes6s.f[2]++;
	  cov_1fm34qes6s.s[3]++;
	  return {
	    left: Math.round(playerSize.width * pointerPosition.x),
	    top: Math.round(playerSize.height - playerSize.height * pointerPosition.y)
	  };
	}

	function onContextMenu(e) {
	  var _this = this;

	  cov_1fm34qes6s.f[3]++;
	  cov_1fm34qes6s.s[4]++;

	  if (hasMenu(this)) {
	    cov_1fm34qes6s.b[2][0]++;
	    cov_1fm34qes6s.s[5]++;
	    this.contextmenuUI.menu.dispose();
	    cov_1fm34qes6s.s[6]++;
	    return;
	  } else {
	    cov_1fm34qes6s.b[2][1]++;
	  }

	  cov_1fm34qes6s.s[7]++;

	  if (this.contextmenuUI.options_.excludeElements(e.target)) {
	    cov_1fm34qes6s.b[3][0]++;
	    cov_1fm34qes6s.s[8]++;
	    return;
	  } else {
	    cov_1fm34qes6s.b[3][1]++;
	  }

	  var pointerPosition = (cov_1fm34qes6s.s[9]++, getPointerPosition(this.el(), e));
	  var playerSize = (cov_1fm34qes6s.s[10]++, this.el().getBoundingClientRect());
	  var menuPosition = (cov_1fm34qes6s.s[11]++, findMenuPosition(pointerPosition, playerSize));
	  var documentEl = (cov_1fm34qes6s.s[12]++, videojs.browser.IS_FIREFOX ? (cov_1fm34qes6s.b[4][0]++, document_1.documentElement) : (cov_1fm34qes6s.b[4][1]++, document_1));
	  cov_1fm34qes6s.s[13]++;
	  e.preventDefault();
	  var menu = (cov_1fm34qes6s.s[14]++, this.contextmenuUI.menu = new ContextMenu(this, {
	    content: (cov_1fm34qes6s.b[5][0]++, isFunction(this.contextmenuUI.content)) && (cov_1fm34qes6s.b[5][1]++, this.contextmenuUI.content()) || (cov_1fm34qes6s.b[5][2]++, this.contextmenuUI.content),
	    position: menuPosition
	  }));
	  cov_1fm34qes6s.s[15]++;

	  this.contextmenuUI.closeMenu = function () {
	    cov_1fm34qes6s.f[4]++;
	    cov_1fm34qes6s.s[16]++;
	    videojs.log.warn('player.contextmenuUI.closeMenu() is deprecated, please use player.contextmenuUI.menu.dispose() instead!');
	    cov_1fm34qes6s.s[17]++;
	    menu.dispose();
	  };

	  cov_1fm34qes6s.s[18]++;
	  menu.on('dispose', function () {
	    cov_1fm34qes6s.f[5]++;
	    cov_1fm34qes6s.s[19]++;
	    videojs.off(documentEl, ['click', 'tap'], menu.dispose);
	    cov_1fm34qes6s.s[20]++;

	    _this.removeChild(menu);

	    cov_1fm34qes6s.s[21]++;
	    delete _this.contextmenuUI.menu;
	  });
	  cov_1fm34qes6s.s[22]++;
	  this.addChild(menu);
	  var menuSize = (cov_1fm34qes6s.s[23]++, menu.el_.getBoundingClientRect());
	  var bodySize = (cov_1fm34qes6s.s[24]++, document_1.body.getBoundingClientRect());
	  cov_1fm34qes6s.s[25]++;

	  if ((cov_1fm34qes6s.b[7][0]++, this.contextmenuUI.keepInside) || (cov_1fm34qes6s.b[7][1]++, menuSize.right > bodySize.width) || (cov_1fm34qes6s.b[7][2]++, menuSize.bottom > bodySize.height)) {
	    cov_1fm34qes6s.b[6][0]++;
	    cov_1fm34qes6s.s[26]++;
	    menu.el_.style.left = Math.floor(Math.min(menuPosition.left, this.player_.currentWidth() - menu.currentWidth())) + 'px';
	    cov_1fm34qes6s.s[27]++;
	    menu.el_.style.top = Math.floor(Math.min(menuPosition.top, this.player_.currentHeight() - menu.currentHeight())) + 'px';
	  } else {
	    cov_1fm34qes6s.b[6][1]++;
	  }

	  cov_1fm34qes6s.s[28]++;
	  videojs.on(documentEl, ['click', 'tap'], menu.dispose);
	}

	function contextmenuUI(options) {
	  var _this2 = this;

	  cov_1fm34qes6s.f[6]++;
	  var defaults = (cov_1fm34qes6s.s[29]++, {
	    keepInside: true,
	    excludeElements: excludeElements
	  });
	  cov_1fm34qes6s.s[30]++;
	  options = videojs.mergeOptions(defaults, options);
	  cov_1fm34qes6s.s[31]++;

	  if ((cov_1fm34qes6s.b[9][0]++, !Array.isArray(options.content)) && (cov_1fm34qes6s.b[9][1]++, !Array.isArray(options.content()))) {
	    cov_1fm34qes6s.b[8][0]++;
	    cov_1fm34qes6s.s[32]++;
	    throw new Error('"content" required');
	  } else {
	    cov_1fm34qes6s.b[8][1]++;
	  }

	  cov_1fm34qes6s.s[33]++;

	  if (hasMenu(this)) {
	    cov_1fm34qes6s.b[10][0]++;
	    cov_1fm34qes6s.s[34]++;
	    this.contextmenuUI.menu.dispose();
	    cov_1fm34qes6s.s[35]++;
	    this.off('contextmenu', this.contextmenuUI.onContextMenu);
	    cov_1fm34qes6s.s[36]++;
	    delete this.contextmenuUI;
	  } else {
	    cov_1fm34qes6s.b[10][1]++;
	  }

	  var cmui = (cov_1fm34qes6s.s[37]++, this.contextmenuUI = function () {
	    cov_1fm34qes6s.f[7]++;
	    cov_1fm34qes6s.s[38]++;
	    contextmenuUI.apply(this, arguments);
	  });
	  cov_1fm34qes6s.s[39]++;
	  cmui.onContextMenu = videojs.bind(this, onContextMenu);
	  cov_1fm34qes6s.s[40]++;
	  cmui.content = options.content;
	  cov_1fm34qes6s.s[41]++;
	  cmui.keepInside = options.keepInside;
	  cov_1fm34qes6s.s[42]++;
	  cmui.options_ = options;
	  cov_1fm34qes6s.s[43]++;
	  cmui.VERSION = version;
	  cov_1fm34qes6s.s[44]++;
	  this.on('contextmenu', cmui.onContextMenu);
	  cov_1fm34qes6s.s[45]++;
	  this.ready(function () {
	    cov_1fm34qes6s.f[8]++;
	    cov_1fm34qes6s.s[46]++;
	    return _this2.addClass('vjs-contextmenu-ui');
	  });
	}

	cov_1fm34qes6s.s[47]++;
	videojs.registerPlugin('contextmenuUI', contextmenuUI);
	cov_1fm34qes6s.s[48]++;
	contextmenuUI.VERSION = version;

	/*! @name videojs-contextmenu @version 2.0.2 @license Apache-2.0 */

	var version$1 = "2.0.2";

	/**
	 * @module plugin
	 */

	var registerPlugin = videojs.registerPlugin || videojs.plugin;
	/* eslint func-style: 0 */

	var defaults = {
	  cancel: true,
	  sensitivity: 10,
	  wait: 500,
	  disabled: false
	};
	var EVENT_NAME = 'vjs-contextmenu';
	/**
	 * Abstracts a DOM standard event into a vjs-contextmenu event.
	 *
	 * @private
	 * @param  {Player} player
	 * @param  {Event} event
	 *         A triggering, native event.
	 * @return {Player}
	 */

	function sendAbstractedEvent(player, event) {
	  if (player.contextmenu.options.disabled) {
	    // videojs-contextmenu is disabled
	    return player;
	  }

	  var abstracted = {
	    target: player,
	    type: EVENT_NAME
	  };
	  ['clientX', 'clientY', 'pageX', 'pageY', 'screenX', 'screenY'].forEach(function (k) {
	    abstracted[k] = event[k];
	  });
	  return player.trigger(abstracted);
	}
	/**
	 * Handles both touchcancel and touchend events.
	 *
	 * @private
	 * @param  {Event} e
	 */


	function handleTouchEnd(e) {
	  var current = this.contextmenu.current;

	  if (!current) {
	    return;
	  }

	  var wait = this.contextmenu.options.wait;

	  if (e.type === 'touchend' && Number(new Date()) - current.time >= wait) {
	    sendAbstractedEvent(this, e);
	  }

	  this.contextmenu.current = null;
	}
	/**
	 * Handles touchmove events.
	 *
	 * @private
	 * @param  {Event} e
	 */


	function handleTouchMove(e) {
	  var current = this.contextmenu.current;

	  if (!current) {
	    return;
	  }

	  var touch = e.touches[0];
	  var sensitivity = this.contextmenu.options.sensitivity; // Cancel the current touch if the pointer has moved in either direction
	  // more than the sensitivity number of pixels.

	  if (touch.screenX - current.screenX > sensitivity || touch.screenY - current.screenY > sensitivity) {
	    this.contextmenu.current = null;
	  }
	}
	/**
	 * Handles touchstart events.
	 *
	 * @private
	 * @param  {Event} e
	 */


	function handleTouchStart(e) {
	  // We only care about the first touch point.
	  if (this.contextmenu.current) {
	    return;
	  }

	  var touch = e.touches[0];
	  this.contextmenu.current = {
	    screenX: touch.screenX,
	    screenY: touch.screenY,
	    time: Number(new Date())
	  };
	}
	/**
	 * Handles contextmenu events.
	 *
	 * @private
	 * @param  {Event} e
	 */


	function handleContextMenu(e) {
	  if (this.contextmenu.options.cancel && !this.contextmenu.options.disabled) {
	    e.preventDefault();
	  }

	  sendAbstractedEvent(this, e); // If we get a "contextmenu" event, we can rely on that going forward
	  // because this client supports it; so, we can stop listening for
	  // touch events.

	  this.off(['touchcancel', 'touchend'], handleTouchEnd);
	  this.off('touchmove', handleTouchMove);
	  this.off('touchstart', handleTouchStart);
	}
	/**
	 * A cross-device context menu implementation for video.js players.
	 *
	 * @param    {Object}  [options={}]
	 * @param    {Boolean} [cancel=true]
	 *           Whether or not to cancel the native "contextmenu" event when
	 *           it is seen.
	 *
	 * @param    {Number} [sensitivity=10]
	 *           The maximum number of pixels a finger can move because a touch
	 *           is no longer considered to be "held".
	 *
	 * @param    {Number} [wait=500]
	 *           The minimum number of milliseconds a touch must be "held" before
	 *           it registers.
	 */


	function contextmenu(options) {
	  var _this = this;

	  this.contextmenu.options = videojs.mergeOptions(defaults, options);
	  this.contextmenu.VERSION = '__VERSION__';
	  this.on('contextmenu', handleContextMenu);
	  this.on(['touchcancel', 'touchend'], handleTouchEnd);
	  this.on('touchmove', handleTouchMove);
	  this.on('touchstart', handleTouchStart);
	  this.ready(function () {
	    return _this.addClass(EVENT_NAME);
	  });
	}

	registerPlugin('contextmenu', contextmenu);
	contextmenu.VERSION = version$1;

	QUnit.test('the environment is sane', function (assert) {
	  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
	  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
	  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
	  assert.strictEqual(typeof contextmenuUI, 'function', 'plugin is a function');
	});
	QUnit.module('videojs-contextmenu-ui', {
	  beforeEach: function beforeEach() {
	    // Mock the environment's timers because certain things - particularly
	    // player readiness - are asynchronous in video.js 5. This MUST come
	    // before any player is created; otherwise, timers could get created
	    // with the actual timer methods!
	    this.clock = sinon.useFakeTimers();
	    this.fixture = document_1.getElementById('qunit-fixture');
	    this.video = document_1.createElement('video');
	    this.fixture.appendChild(this.video);
	    this.player = videojs(this.video);
	    this.player.contextmenuUI({
	      content: [{
	        href: 'https://www.brightcove.com/',
	        label: 'Brightcove'
	      }, {
	        label: 'Example Link',
	        listener: function listener() {
	          videojs.log('you clicked the example link!');
	        }
	      }]
	    }); // Tick the clock forward enough to trigger the player to be "ready".

	    this.clock.tick(1);
	  },
	  afterEach: function afterEach() {
	    // Make sure we shut off document-level listeners we may have created!
	    // videojs.off(document, ['mousedown', 'touchstart']);
	    this.player.dispose();
	    this.clock.restore();
	  }
	});
	QUnit.test('opens a custom context menu on the first "contextmenu" event encountered', function (assert) {
	  this.player.trigger({
	    type: 'contextmenu',
	    pageX: 0,
	    pageY: 0
	  });
	  assert.strictEqual(this.player.$$('.vjs-contextmenu-ui-menu').length, 1);
	});
	QUnit.test('closes the custom context menu on the second "contextmenu" event encountered', function (assert) {
	  this.player.trigger({
	    type: 'contextmenu',
	    pageX: 0,
	    pageY: 0
	  });
	  this.player.trigger({
	    type: 'contextmenu',
	    pageX: 0,
	    pageY: 0
	  });
	  assert.strictEqual(this.player.$$('.vjs-contextmenu-ui-menu').length, 0);
	});
	QUnit.test('closes the custom context menu when interacting with the player or document outside the menu', function (assert) {
	  this.player.trigger({
	    type: 'contextmenu',
	    pageX: 0,
	    pageY: 0
	  }); // A workaround for Firefox issue  where "oncontextmenu" event
	  // leaks "click" event to document  https://bugzilla.mozilla.org/show_bug.cgi?id=990614

	  var documentEl = videojs.browser.IS_FIREFOX ? document_1.documentElement : document_1;
	  videojs.trigger(documentEl, 'click');
	  assert.strictEqual(this.player.$$('.vjs-contextmenu-ui-menu').length, 0);
	});
	QUnit.test('do not open context menu if in excluded element', function (assert) {
	  var inputElement = document_1.createElement('input');
	  inputElement.className = 'vjs-input-element';
	  this.player.createModal(inputElement);
	  var rightClick = document_1.createEvent('MouseEvents');
	  rightClick.initMouseEvent('contextmenu', true, true, this.window, 1, 0, 0, 0, 0, false, false, false, false, 2, null);
	  this.player.$('.vjs-input-element').dispatchEvent(rightClick);
	  assert.strictEqual(this.player.$$('.vjs-contextmenu-ui-menu').length, 0);
	});
	QUnit.test('do not open context menu if in custom excluded element', function (assert) {
	  var divElement = document_1.createElement('a');
	  divElement.className = 'vjs-anchor-element';
	  this.player.el().appendChild(divElement);

	  this.player.contextmenuUI.options_.excludeElements = function (targetEl) {
	    var tagName = targetEl.tagName.toLowerCase();
	    return tagName === 'a';
	  };

	  var rightClick = document_1.createEvent('MouseEvents');
	  rightClick.initMouseEvent('contextmenu', true, true, this.window, 1, 0, 0, 0, 0, false, false, false, false, 2, null);
	  this.player.$('.vjs-anchor-element').dispatchEvent(rightClick);
	  assert.strictEqual(this.player.$$('.vjs-contextmenu-ui-menu').length, 0);
	});

}(QUnit,sinon,videojs));
