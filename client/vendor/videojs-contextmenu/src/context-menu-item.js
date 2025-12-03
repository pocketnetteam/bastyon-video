import window from 'global/window';
import videojs from 'video.js';

const MenuItem = videojs.getComponent('MenuItem');

class ContextMenuItem extends MenuItem {

  handleClick(e) {
    super.handleClick();
    this.options_.listener();

    // Close the containing menu after the call stack clears.
    window.setTimeout(() => {
      this.player().contextmenuUI.menu.dispose();
    }, 1);
  }

  createEl(type, props, attrs) {
    const el = super.createEl(type, props, attrs);

    const newEl = videojs.dom.createEl('span');

    newEl.innerHTML = `<span class="vjs-menu-item-text">${this.localize(this.options_.label)}</span>`;

    el.replaceChild(newEl, el.querySelector('.vjs-menu-item-text'));

    return el;
  }
}

export default ContextMenuItem;
