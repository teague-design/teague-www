import * as core from "../core";
import BaseController from "./controllers/BaseController";
import ImageController from "./controllers/ImageController";
// import AnimateController from "./controllers/AnimateController";
import ThemeController from "./controllers/ThemeController";
import HomeController from "./controllers/HomeController";
import PagesController from "./controllers/PagesController";
import Form from "./components/Form";
import View from "./components/View";
import Taxi from "./components/Taxi";
import Video from "./components/Video";
import Slider from "./components/Slider";



/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.element = options.el;
        this.callback = options.cb;
        this.controllers = [];
    }


    push ( id, elements, controller, component ) {
        this.controllers.push({
            id,
            elements,
            instance: null,
            Controller: controller,
            component
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length ) {
                controller.instance = new controller.Controller(
                    controller.elements,
                    controller.component
                );
            }
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];
    }


    exec () {
        this.controllers = [];

        // Uses BaseController
        this.push( "form", core.dom.body.find( ".js-form" ), BaseController, Form );
        this.push( "view", core.dom.body.find( ".js-view" ), BaseController, View );
        this.push( "taxi", core.dom.body.find( ".js-taxi" ), BaseController, Taxi );
        this.push( "video", core.dom.body.find( ".js-video" ), BaseController, Video );
        this.push( "slider", core.dom.body.find( ".js-slider" ), BaseController, Slider );

        // Unique Controllers...
        this.push( "theme", core.dom.body.find( ".js-theme" ), ThemeController );
        this.push( "home", core.dom.body.find( ".js-home" ), HomeController );
        this.push( "pages", core.dom.body.find( ".js-pages" ), PagesController );

        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            this.init();

            if ( this.callback ) {
                this.callback();
            }
        });
    }


    animate () {
        // this.animates = this.element.find( core.config.lazyAnimSelector );
        // this.animController = new AnimateController( this.element, this.animates, 10 );
        // this.animController.start();
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        // if ( this.animController ) {
        //     this.animController.destroy();
        // }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
