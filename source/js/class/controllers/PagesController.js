import ScrollController from "properjs-scrollcontroller";
import * as core from "../../core";


/**
 *
 * @public
 * @global
 * @class PagesController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle animating pages.
 *
 */
class PagesController {
    constructor ( element ) {
        this.element = element;
        this.slices = this.element.find( ".js-slice" );

        this.init();
    }


    init () {
        this.scroller = new ScrollController();
        this.scroller.on( "scroll", () => {
            this.handle();
        });

        this.handle();
    }


    handle () {
        this.slices = this.element.find( ".js-slice" ).not( ".is-animated" );

        if ( !this.slices.length ) {
            this.scroller.stop();
            this.scroller = null;

            core.log( "[PagesController] Done!" );

        } else {
            const visible = core.util.getElementsInView( this.slices );

            if ( visible.length ) {
                visible.addClass( "is-animated" );
            }
        }
    }


    destroy () {
        if ( this.scroller ) {
            this.scroller.destroy();
            this.scroller = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default PagesController;
