// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
import router from "./router";
import * as core from "./core";
import navi from "./modules/navi";
import Tracker from "./class/services/Tracker";


/**
 *
 * @public
 * @class App
 * @classdesc One Class to rule them all!
 *
 */
class App {
    constructor () {
        this.tracker = new Tracker();
        this.core = core;
        this.router = router;
        this.navi = navi;

        this.init();
    }


    init () {
        this.core.detect.init();
        this.router.init();
        this.navi.init();
        this.router.load().then( () => {} ).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
