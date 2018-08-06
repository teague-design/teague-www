import $ from "properjs-hobo";
import Form from "../components/Form";


/**
 *
 * @public
 * @global
 * @class FormController
 * @param {Element} elements The dom elements to work with.
 * @classdesc Handle forms.
 *
 */
class FormController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.elements.forEach(( node ) => {
            const elem = $( node );
            const data = elem.data();

            this.instances.push( new Form( elem, data ) );
        });
    }


    destroy () {
        this.instances.forEach(( instance ) => {
            instance.destroy();
            instance = null;
        });
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default FormController;
