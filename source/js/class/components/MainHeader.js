import * as core from "../../core";


/**
 *
 * @public
 * @global
 * @class MainHeader
 * @param {Element} element The dom element to work with.
 * @param {Object} data The dom element data to work with.
 * @classdesc Handle main header intersection animations.
 *
 */
class MainHeader {
    constructor ( element, data ) {
        this.element = element;
        this.data = data;
        this.prop = this[ this.data.prop ] ? this[ this.data.prop ].bind( this ) : () => {};

        if ( !core.detect.isDevice() ) {
            this.init();
            this.prop();
        }
    }


    init () {

        // TODO: clean this up
        const titleEl = document.querySelector(".main__header__title");
        const config = {
            threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
        };
        const intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                titleEl.style.opacity = entry.intersectionRatio;
            });
        }, config);
        // get your elements, by class name '.js-item'
        const element = document.querySelector('.js-main-header-sentinal');

        if (element) {
            intersectionObserver.observe(element);
        }
    }

    destroy () {
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default MainHeader;
