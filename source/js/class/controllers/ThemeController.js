import * as core from "../../core";
import $ from "properjs-hobo";


/**
 *
 * @public
 * @global
 * @class ThemeController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle theming pages.
 *
 */
class ThemeController {
    constructor ( element ) {
        this.element = element;
        this.swatches = this.element.find( ".js-theme-swatch" );
        this.classes = {
            white: "is-theme-white",
            black: "is-theme-black",
            spot: "is-theme-spot"
        };

        if ( this.element.length ) {
            this.bind();
        }
    }


    bind () {
        this.element.on( "click", ( e ) => {
            const swatch = $( e.target );
            const data = swatch.data();

            this.swatches.removeClass( "is-active" );
            swatch.addClass( "is-active" );

            core.dom.html.removeClass( `${this.classes.white} ${this.classes.black} ${this.classes.spot}` );
            core.dom.html.addClass( this.classes[ data.theme ] );
        });
    }


    destroy () {
        this.element.off();
        core.dom.html.removeClass( `${this.classes.white} ${this.classes.black} ${this.classes.spot}` );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default ThemeController;
