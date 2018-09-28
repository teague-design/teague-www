import Controller from "properjs-controller";
import * as core from "../../core";


/**
 *
 * @public
 * @global
 * @class AnimateController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle scroll events for a DOMElement.
 *
 */
class AnimateController extends Controller {
    constructor ( elements ) {
        super();
        this.elements = elements;
        this.start();
    }


    start () {
        // Call on parent cycle
        this.go(() => {
            const elems = this.elements.not( ".is-animated" );

            if ( !elems.length ) {
                this.destroy();
                core.log( "AnimateController::self_destruct", this );

            } else {
                elems.forEach(( element, i ) => {
                    if ( core.util.isElementVisible( element ) ) {
                        elems.eq( i ).addClass( "is-animated" );
                    }
                });
            }
        });
    }


    destroy () {
        this.stop();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default AnimateController;
