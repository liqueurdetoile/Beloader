/**
*  @file ScriptLoader.js
*  @author Liqueur de Toile <contact@liqueurdetoile.com>
*  @licence AGPL-3.0 {@link https://github.com/liqueurdetoile/beloader/blob/master/LICENSE}
*/

import AbstractLoader from 'core/AbstractLoader';

/**
*  Loads external javascript
*
*  @version 1.0.0
*  @since 1.0.0
*  @author Liqueur de Toile <contact@liqueurdetoile.com>
*  @extends {AbstractLoader}
*/
export default class ScriptLoader extends AbstractLoader {
  /**
  *  @version 1.0.0
  *  @since 1.0.0
  *  @author Liqueur de Toile <contact@liqueurdetoile.com>
  *
  *  @param {QueueItem} parent Calling QueueItem
  *  @param {DotObjectArray} options Options for the loader
  *  @param {string} options.url  URL of the script
  *  @param {boolean} [options.inline=false]  If loaded async,
  *  the script will be parsed inline. Otherwise, it will
  *  be loaded through a <script async> tag
  *  @param {Object} [options.attributes] Attributes for the resulting HTML node
  *  @throw {TypeError} If script url is missing
  */
  constructor(parent, options) {
    super(parent, options);
    if (!options.has('url')) throw new TypeError('Beloader : Script url must be defined');
    this.options.define('inline', false);
    /**
    *  Underlying node for insertion
    *  @type {HTMLElement}
    */
    this._node = undefined;
  }

  /**
  *  Getter that generates HTMLElement to contain script (sync or async)
  *
  *  @version 1.0.0
  *  @since 1.0.0
  *  @author Liqueur de Toile <contact@liqueurdetoile.com>
  *  @type {HTMLElement} HTMLElement <script></script>
  */
  get node() {
    if (typeof this._node === 'undefined') {
      this._node = document.createElement('script');
      this._node.setAttribute('type', 'text/javascript');
      if (!this.options.data.async) {
        this._node.setAttribute('src', this.options.data.url);
      }
      this.options.forEach(function (val, attr) {
        this._node.setAttribute(attr, val);
      }.bind(this), 'attributes', null, false);
    }
    return this._node;
  }

  /**
  *  Insert <script> tag with src for sync loading
  *
  *  @version 1.0.0
  *  @since 1.0.0
  *  @author Liqueur de Toile <contact@liqueurdetoile.com>
  *
  *  @returns {Promise} Loading promise
  */
  sync() {
    document.querySelector('head').appendChild(this.node);
    return super.sync();
  }

  /**
  *  Load script and insert response in a <script> tag if
  *  options.inline set to `true` or load the script
  *  with async attribute
  *
  *  @version 1.0.0
  *  @since 1.0.0
  *  @author Liqueur de Toile <contact@liqueurdetoile.com>
  *
  *  @returns {Promise} Loading promise
  */
  async() {
    const _this = this;

    if (this.options.data.inline) {
      let p = super.async();

      p.then(response => {
        if (response) {
          _this.node.innerHTML = response;
          document.querySelector('head').appendChild(_this.node);
        }
      });

      return p;
    }

    this.options.data.async = false;
    if (this.options.has('loader.async')) this.options.push('loader.sync', this.options.pull('loader.async'));
    this.node.setAttribute('async', '');
    return this.sync();
  }
}

export {ScriptLoader};
