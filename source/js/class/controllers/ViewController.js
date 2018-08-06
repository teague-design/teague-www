import View from "../components/View";
import paramalama from "paramalama";



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

            this.instances.push(new View({
                id: data.uid,
                el: elem,
                url: data.url,
                qs: paramalama( window.location.search )
            }));
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
