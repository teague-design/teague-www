import Taxi from "../components/Taxi";



/**
 *
 * @public
 * @class TaxiController
 * @param {Hobo} element The taxonomy filter modules
 * @classdesc Handles filtering stories
 *
 */
class TaxiController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.init();
    }


    init () {
        this.elements.forEach(( el, i ) => {
            const elem = this.elements.eq( i );
            const data = elem.data();

            this.instances.push( new Taxi( elem, data ) );
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
export default TaxiController;
