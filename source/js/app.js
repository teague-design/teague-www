// Load the SASS
require( "../sass/screen.scss" );


// Load the JS
import router from "./router";
import * as core from "./core";
import navi from "./modules/navi";
import Tracker from "./class/services/Tracker";
import ScrollController from "properjs-scrollcontroller";


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
        this.scroller = new ScrollController();
        this.core = core;
        this.router = router;
        this.navi = navi;

        this.init();
        this.bind();
    }


    bind () {
        this.scroller.on( "scroll", () => {
            this.core.emitter.fire( "app--scroll" );
        });
        this.scroller.on( "scrollup", () => {
            const scrollY = this.scroller.getScrollY();

            if ( scrollY <= 125 ) {
                this.core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
            }

            this.core.emitter.fire( "app--scrollup" );
        });
        this.scroller.on( "scrolldown", () => {
            this.core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
            this.core.emitter.fire( "app--scrolldown" );
        });
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
