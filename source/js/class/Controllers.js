import * as core from "../core";
import BaseController from "./controllers/BaseController";
import ImageController from "./controllers/ImageController";
import HomeController from "./controllers/HomeController";
import AnimateController from "./controllers/AnimateController";
import Slice from "./components/Slice";
import Form from "./components/Form";
import View from "./components/View";
import Taxi from "./components/Taxi";
import Video from "./components/Video";
import Slider from "./components/Slider";
import FormOver from "./components/FormOver";
import Mapbox from "./components/Mapbox";
import Triggers from "./components/Triggers";



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

        this.push( "slice", core.dom.body.find( ".js-slice" ), BaseController, Slice );
        this.push( "form", core.dom.body.find( ".js-form" ), BaseController, Form );
        this.push( "view", core.dom.body.find( ".js-view" ), BaseController, View );
        this.push( "taxi", core.dom.body.find( ".js-taxi" ), BaseController, Taxi );
        this.push( "video", core.dom.body.find( ".js-video" ), BaseController, Video );
        this.push( "formover", core.dom.body.find( ".js-formover" ), BaseController, FormOver );
        this.push( "mapbox", core.dom.body.find( ".js-mapbox" ), BaseController, Mapbox );
        this.push( "triggers", core.dom.body.find( ".js-triggers" ), BaseController, Triggers );
        this.push( "home", core.dom.body.find( ".js-home" ), HomeController );
        this.push( "slider", core.dom.body.find( ".js-slider" ), BaseController, Slider );

        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images );
        this.imageController.on( "preloaded", () => {
            this.init();

            if ( this.callback ) {
                this.callback();
            }
        });

        this.animates = this.element.find( core.config.lazyAnimSelector );
        if ( this.animates.length ) {
            this.animateController = new AnimateController( this.animates );
        }
    }


    destroy () {
        if ( this.imageController ) {
            this.imageController.destroy();
        }

        if ( this.animateController ) {
            this.animateController.destroy();
        }

        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
