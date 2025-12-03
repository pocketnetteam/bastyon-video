/*! @name @peertube/videojs-contextmenu @version 5.5.0 @license Apache-2.0 */
import videojs from 'video.js';
import document from 'global/document';
import window from 'global/window';

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

var MenuItem = videojs.getComponent('MenuItem');

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

    _MenuItem.prototype.handleClick.call(this);

    this.options_.listener(); // Close the containing menu after the call stack clears.

    window.setTimeout(function () {
      _this.player().contextmenuUI.menu.dispose();
    }, 1);
  };

  _proto.createEl = function createEl(type, props, attrs) {
    var el = _MenuItem.prototype.createEl.call(this, type, props, attrs);

    var newEl = videojs.dom.createEl('span');
    newEl.innerHTML = "<span class=\"vjs-menu-item-text\">" + this.localize(this.options_.label) + "</span>";
    el.replaceChild(newEl, el.querySelector('.vjs-menu-item-text'));
    return el;
  };

  return ContextMenuItem;
}(MenuItem);

var Menu = videojs.getComponent('Menu'); // support VJS5 & VJS6 at the same time

var dom = videojs.dom || videojs;

var ContextMenu =
/*#__PURE__*/
function (_Menu) {
  _inheritsLoose(ContextMenu, _Menu);

  function ContextMenu(player, options) {
    var _this;

    _this = _Menu.call(this, player, options) || this; // Each menu component has its own `dispose` method that can be
    // safely bound and unbound to events while maintaining its context.

    _this.dispose = videojs.bind(_assertThisInitialized(_this), _this.dispose);
    options.content.forEach(function (c) {
      var fn = function fn() {};

      if (typeof c.listener === 'function') {
        fn = c.listener;
      } else if (typeof c.href === 'string') {
        fn = function fn() {
          return window.open(c.href);
        };
      }

      _this.addItem(new ContextMenuItem(player, {
        label: c.label,
        listener: videojs.bind(player, fn)
      }));
    });
    return _this;
  }

  var _proto = ContextMenu.prototype;

  _proto.createEl = function createEl() {
    var el = _Menu.prototype.createEl.call(this);

    dom.addClass(el, 'vjs-contextmenu-ui-menu');
    el.style.left = this.options_.position.left + 'px';
    el.style.top = this.options_.position.top + 'px';
    return el;
  };

  return ContextMenu;
}(Menu);

// For now, these are copy-pasted from video.js until they are exposed.
/**
 * Offset Left
 * getBoundingClientRect technique from
 * John Resig http://ejohn.org/blog/getboundingclientrect-is-awesome/
 *
 * @function findElPosition
 * @param {Element} el Element from which to get offset
 * @return {Object}
 */

function findElPosition(el) {
  var box;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0
    };
  }

  var docEl = document.documentElement;
  var body = document.body;
  var clientLeft = docEl.clientLeft || body.clientLeft || 0;
  var scrollLeft = window.pageXOffset || body.scrollLeft;
  var left = box.left + scrollLeft - clientLeft;
  var clientTop = docEl.clientTop || body.clientTop || 0;
  var scrollTop = window.pageYOffset || body.scrollTop;
  var top = box.top + scrollTop - clientTop; // Android sometimes returns slightly off decimal values, so need to round

  return {
    left: Math.round(left),
    top: Math.round(top)
  };
}
/**
 * Get pointer position in element
 * Returns an object with x and y coordinates.
 * The base on the coordinates are the bottom left of the element.
 *
 * @function getPointerPosition
 * @param {Element} el Element on which to get the pointer position on
 * @param {Event} event Event object
 * @return {Object}
 *         This object will have x and y coordinates corresponding to the
 *         mouse position
 */

function getPointerPosition(el, event) {
  var position = {};
  var box = findElPosition(el);
  var boxW = el.offsetWidth;
  var boxH = el.offsetHeight;
  var boxY = box.top;
  var boxX = box.left;
  var pageY = event.pageY;
  var pageX = event.pageX;

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  }

  position.y = Math.max(0, Math.min(1, (boxY - pageY + boxH) / boxH));
  position.x = Math.max(0, Math.min(1, (pageX - boxX) / boxW));
  return position;
}
function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

var version = "5.5.0";

/**
 * Whether or not the player has an active context menu.
 *
 * @param  {Player} player
 * @return {boolean}
 */

function hasMenu(player) {
  return player.hasOwnProperty('contextmenuUI') && player.contextmenuUI.hasOwnProperty('menu') && player.contextmenuUI.menu.el();
}
/**
 * Defines which elements should be excluded from displaying the context menu
 *
 * @param  {Object} targetEl The DOM element that is being targeted
 * @return {boolean} Whether or not the element should be excluded from displaying the context menu
 */


function excludeElements(targetEl) {
  var tagName = targetEl.tagName.toLowerCase();
  return tagName === 'input' || tagName === 'textarea';
}
/**
 * Calculates the position of a menu based on the pointer position and player
 * size.
 *
 * @param  {Object} pointerPosition
 * @param  {Object} playerSize
 * @return {Object}
 */


function findMenuPosition(pointerPosition, playerSize) {
  return {
    left: Math.round(playerSize.width * pointerPosition.x),
    top: Math.round(playerSize.height - playerSize.height * pointerPosition.y)
  };
}
/**
 * Handles contextmenu events.
 *
 * @param  {Event} e
 */


function onContextMenu(e) {
  var _this = this;

  // If this event happens while the custom menu is open, close it and do
  // nothing else. This will cause native contextmenu events to be intercepted
  // once again; so, the next time a contextmenu event is encountered, we'll
  // open the custom menu.
  if (hasMenu(this)) {
    this.contextmenuUI.menu.dispose();
    return;
  }

  if (this.contextmenuUI.options_.excludeElements(e.target)) {
    return;
  } // Calculate the positioning of the menu based on the player size and
  // triggering event.


  var pointerPosition = getPointerPosition(this.el(), e);
  var playerSize = this.el().getBoundingClientRect();
  var menuPosition = findMenuPosition(pointerPosition, playerSize); // A workaround for Firefox issue  where "oncontextmenu" event
  // leaks "click" event to document https://bugzilla.mozilla.org/show_bug.cgi?id=990614

  var documentEl = videojs.browser.IS_FIREFOX ? document.documentElement : document;
  e.preventDefault();
  var menu = this.contextmenuUI.menu = new ContextMenu(this, {
    content: isFunction(this.contextmenuUI.content) && this.contextmenuUI.content() || this.contextmenuUI.content,
    position: menuPosition
  }); // This is for backward compatibility. We no longer have the `closeMenu`
  // function, but removing it would necessitate a major version bump.

  this.contextmenuUI.closeMenu = function () {
    videojs.log.warn('player.contextmenuUI.closeMenu() is deprecated, please use player.contextmenuUI.menu.dispose() instead!');
    menu.dispose();
  };

  menu.on('dispose', function () {
    videojs.off(documentEl, ['click', 'tap'], menu.dispose);

    _this.removeChild(menu);

    delete _this.contextmenuUI.menu;
  });
  this.addChild(menu);
  var menuSize = menu.el_.getBoundingClientRect();
  var bodySize = document.body.getBoundingClientRect();

  if (this.contextmenuUI.keepInside || menuSize.right > bodySize.width || menuSize.bottom > bodySize.height) {
    menu.el_.style.left = Math.floor(Math.min(menuPosition.left, this.player_.currentWidth() - menu.currentWidth())) + 'px';
    menu.el_.style.top = Math.floor(Math.min(menuPosition.top, this.player_.currentHeight() - menu.currentHeight())) + 'px';
  }

  videojs.on(documentEl, ['click', 'tap'], menu.dispose);
}
/**
 * Creates a menu for contextmenu events.
 *
 * @function contextmenuUI
 * @param    {Object} options
 * @param    {Array}  options.content
 *           An array of objects which populate a content list within the menu.
 * @param    {boolean}  options.keepInside
 *           Whether to always keep the menu inside the player
 * @param    {function}  options.excludeElements
 *           Defines which elements should be excluded from displaying the context menu
 */


function contextmenuUI(options) {
  var _this2 = this;

  var defaults = {
    keepInside: true,
    excludeElements: excludeElements
  };
  options = videojs.mergeOptions(defaults, options);

  if (!Array.isArray(options.content) && !Array.isArray(options.content())) {
    throw new Error('"content" required');
  } // If we have already invoked the plugin, teardown before setting up again.


  if (hasMenu(this)) {
    this.contextmenuUI.menu.dispose();
    this.off('contextmenu', this.contextmenuUI.onContextMenu); // Deleting the player-specific contextmenuUI plugin function/namespace will
    // restore the original plugin function, so it can be called again.

    delete this.contextmenuUI;
  } // Wrap the plugin function with an player instance-specific function. This
  // allows us to attach the menu to it without affecting other players on
  // the page.


  var cmui = this.contextmenuUI = function () {
    contextmenuUI.apply(this, arguments);
  };

  cmui.onContextMenu = videojs.bind(this, onContextMenu);
  cmui.content = options.content;
  cmui.keepInside = options.keepInside;
  cmui.options_ = options;
  cmui.VERSION = version;
  this.on('contextmenu', cmui.onContextMenu);
  this.ready(function () {
    return _this2.addClass('vjs-contextmenu-ui');
  });
}

videojs.registerPlugin('contextmenuUI', contextmenuUI);
contextmenuUI.VERSION = version;

export default contextmenuUI;
