import * as core from "../../core";
import Controller from "properjs-controller";


/**
 *
 * @public
 * @global
 * @class Slice
 * @param {Element} element The dom element to work with.
 * @param {Object} data The dom element data to work with.
 * @classdesc Handle slice animations.
 *
 */
class Slice {
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
        console.log("init slice");
        // this.element[ 0 ].style.zIndex = this.data.index;

        // TODO: clean this up
        const titleEl = document.querySelector(".main__header__title")
        const config = {
            threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
        };  
        const intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => titleEl.style.opacity = entry.intersectionRatio);
        }, config);
          
        // get your elements, by class name '.js-item'
        const element = document.querySelector('.js-main-header-sentinal')
        if(element) {
            intersectionObserver.observe(element)
        }
    }


    page_header () {
        console.log("page_header");
        this.isFixedImage = false;
        this.page = this.element.find( ".js-page-header" );
        this.title = this.element.find( ".js-page-header-title" );
        this.image = this.element.find( ".js-page-header-image" );
        this.deets = this.element.find( ".js-page-header-deets" );
        this.tag = this.element.find( ".js-page-header-tag" );

        

        if ( this.image.length ) {
            this.controller = new Controller();
            this.controller.go(() => {
                this.titleBounds = this.title[ 0 ].getBoundingClientRect();
                this.imageBounds = this.image[ 0 ].getBoundingClientRect();
                this.deetsBounds = this.deets[ 0 ].getBoundingClientRect();
                this.elemBounds = this.element[ 0 ].getBoundingClientRect();
                this.imagePadding = parseInt( window.getComputedStyle( this.image[ 0 ] )[ "padding-top" ], 10 );
                this.pagePadding = parseInt( window.getComputedStyle( this.page[ 0 ] )[ "padding-top" ], 10 );
                this.imageOffset = this.imageBounds.top + this.imagePadding;
                this.viewport = {
                    height: window.innerHeight,
                    width: window.innerWidth
                };

                // Apply container and static styles
                this.deets[ 0 ].style.paddingTop = "160px";
                this.deets[ 0 ].style.paddingBottom = "160px";
                this.element[ 0 ].style.height = `${this.pagePadding + this.titleBounds.height + this.imageBounds.height + this.deetsBounds.height}px`;

                // Apply dynamic element styles
                this.title[ 0 ].style.position = "fixed";
                this.title[ 0 ].style.zIndex = "2";
                this.deets[ 0 ].style.position = "relative";
                this.deets[ 0 ].style.zIndex = "2";
                this.image[ 0 ].style.zIndex = "1";
                this.image[ 0 ].style.position = "fixed";
                this.page[ 0 ].style.height = "100vh";
                this.page[ 0 ].style.width = "100vw";
                this.page[ 0 ].style.position = "fixed";
                this.page[ 0 ].style.left = "0";
                this.page[ 0 ].style.top = "0";

                // Handle image visibility scenario
                if ( (this.deetsBounds.top <= this.imageBounds.top) || !core.util.isElementVisible( this.element[ 0 ] ) ) {
                    this.image[ 0 ].style.visibility = "hidden";

                } else {
                    this.image[ 0 ].style.visibility = "visible";
                }

                // Handle visibility scenario
                if ( core.util.isElementVisible( this.element[ 0 ] ) ) {
                    this.element[ 0 ].style.visibility = "visible";

                } else {
                    this.element[ 0 ].style.visibility = "hidden";
                    return;
                }

                // Handle image fix scenario
                if ( !this.isFixedImage && this.imageBounds.top <= 0 ) {
                    this.isFixedImage = true;
                    this.image[ 0 ].style.top = "0";
                    this.image[ 0 ].style.left = "0";

                } else if ( this.isFixedImage && this.deetsBounds.top >= this.imageBounds.bottom ) {
                    this.isFixedImage = false;
                    this.image[ 0 ].style.top = "auto";
                    this.image[ 0 ].style.left = "auto";
                }

                // Transform image accordingly
                if ( !this.isFixedImage ) {
                    if ( !this.tag.length ) {
                        this.title[ 0 ].style.opacity = "1";

                    } else {
                        this.title.removeClass( "is-textchange" );
                    }

                    core.util.translate3d(
                        this.image[ 0 ],
                        0,
                        `${this.elemBounds.top + this.titleBounds.height}px`,
                        0
                    );

                } else if ( this.isFixedImage ) {
                    if ( !this.tag.length ) {
                        this.title[ 0 ].style.opacity = (1 - (this.viewport.height - this.deetsBounds.top) / (this.viewport.height - this.titleBounds.top));

                    } else {
                        this.title.addClass( "is-textchange" );
                    }

                    core.util.translate3d(
                        this.image[ 0 ],
                        0,
                        0,
                        0
                    );
                }

                // Transform description accordingly
                core.util.translate3d(
                    this.deets[ 0 ],
                    0,
                    `${this.elemBounds.top + this.titleBounds.height + this.imageBounds.height}px`,
                    0
                );
            });
        }
    }


    destroy () {
        if ( this.controller ) {
            this.controller.stop();
            this.controller = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Slice;
