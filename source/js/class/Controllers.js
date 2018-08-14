import * as core from "../core";
import ImageController from "./controllers/ImageController";
import AnimateController from "./controllers/AnimateController";
import FormController from "./controllers/FormController";
import ThemeController from "./controllers/ThemeController";
import ViewController from "./controllers/ViewController";
import TaxiController from "./controllers/TaxiController";
import VideoController from "./controllers/VideoController";


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


    push ( id, elements, controller, conditions ) {
        this.controllers.push({
            id: id,
            elements: elements,
            instance: null,
            Controller: controller,
            conditions: conditions
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length && controller.conditions ) {
                controller.instance = new controller.Controller( controller.elements );
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

        this.push( "form", core.dom.body.find( ".js-form" ), FormController, true );
        this.push( "view", core.dom.body.find( ".js-view" ), ViewController, true );
        this.push( "taxi", core.dom.body.find( ".js-taxi" ), TaxiController, true );
        this.push( "video", core.dom.body.find( ".js-video" ), VideoController, true );
        this.push( "theme", this.element.find( ".js-theme" ), ThemeController, true );

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
        this.animates = this.element.find( core.config.lazyAnimSelector );
        this.animController = new AnimateController( this.element, this.animates, 10 );
        this.animController.start();
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        if ( this.animController ) {
            this.animController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
