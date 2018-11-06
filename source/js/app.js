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
        this.bind();
    }


    bind () {
    }


    init () {
        this.core.detect.init();
        this.router.init();
        this.navi.init();
        this.router.load().then( () => {
            this.core.dom.html.removeClass( "is-not-ready" );
            this.core.dom.body.removeClass( "is-not-ready" );

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });

        // TODO: clean this up
        const intersectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
              if (entry.intersectionRatio > 0) {
                this.core.dom.html.addClass( "is-scroll-up" ).removeClass( "is-scroll-down" );
                this.core.emitter.fire( "app--scrollup" );
              }else{
                this.core.dom.html.addClass( "is-scroll-down" ).removeClass( "is-scroll-up" );
                this.core.emitter.fire( "app--scrolldown" );
              }
              
              // it's good to remove observer,
              // if you don't need it any more
            //   observer.unobserve(entry.target);
            });
          });
          
          // get your elements, by class name '.js-item'
          const elements = [...document.querySelectorAll('.js-header-sentinal')];
          
          // start observing your elements
          elements.forEach((element) => intersectionObserver.observe(element));

    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
