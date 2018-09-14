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
        this.onScroller = () => {
            this.handle();
        };
        this._onScroller = this.onScroller.bind( this );
        core.emitter.on( "app--scroll", this._onScroller );
        this.handle();
    }


    handle () {
        this.slices = this.element.find( ".js-slice" ).not( ".is-animated" );

        if ( !this.slices.length ) {
            this.destroy();
            core.log( "[PagesController] Done!" );

        } else {
            const visible = core.util.getElementsInView( this.slices );

            if ( visible.length ) {
                visible.addClass( "is-animated" );
            }
        }
    }


    destroy () {
        if ( this._onScroller ) {
            core.emitter.off( "app--scroll", this._onScroller );
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default PagesController;
