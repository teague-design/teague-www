import View from "../components/View";



/**
 *
 * @public
 * @class ViewController
 * @param {Hobo} elements The ajax/js-template view modules
 * @classdesc Handles views
 *
 */
class ViewController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.init();
    }


    init () {
        this.elements.forEach(( el, i ) => {
            const elem = this.elements.eq( i );
            const data = elem.data();

            this.instances.push( new View( elem, data ) );
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
export default ViewController;
