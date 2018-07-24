// import * as core from "../../core";


/**
 *
 * @public
 * @global
 * @class FormController
 * @param {Element} element The dom element to work with.
 * @classdesc Handle forms.
 *
 */
class FormController {
    constructor ( element ) {
        this.element = element;
        this.data = this.element.data();

        this.bind();
    }


    bind () {
        this.element.on( "submit", ( e ) => {
            e.preventDefault();
            console.log( this, e );
            return false;
        });
    }


    destroy () {
        this.element.off();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default FormController;
