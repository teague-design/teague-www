import * as core from "../../core";
import $ from "properjs-hobo";
import ImageController from "../controllers/ImageController";


/**
 *
 * @public
 * @global
 * @class View
 * @param {object} args The settings for the view
 * @classdesc Handle shared view functionality.
 *
 * @todo: Use ./core/cache for data and try that first
 *
 */
class View {
    // args { id, el, url, qs, cb }
    constructor ( args ) {
        this.id = args.id;
        this.element = args.el;
        this.endpoint = args.url;
        this.callback = args.cb;
        this.query = args.qs;
        this.json = null;
        this.controllers = {};
        this.dataType = "json";
        this.method = "GET";

        this.init();
    }


    /**
     *
     * @instance
     * @description Run the View initialization stack
     * @memberof View
     * @method init
     *
     */
    init () {
        this.load().then( ( json ) => {
            this.json = json;
            this.render();
            this.exec();
            this.done();
        });
    }


    /**
     *
     * @instance
     * @description Fire callback when init stack is done
     * @memberof View
     * @method done
     *
     */
    done () {
        if ( typeof this.callback === "function" ) {
            this.callback();
        }
    }


    /**
     *
     * @instance
     * @description Get the data for the view
     * @memberof View
     * @method load
     * @returns {Promise}
     *
     */
    load () {
        return new Promise(( resolve ) => {
            const cache = core.cache.get( `partial--${this.id}` );
            const query = this.query || {};

            // Set these for Clutch API partial rendering
            // query.format = "html";
            // query.template = this.id;

            if ( cache ) {
                resolve( cache );

            } else {
                $.ajax({
                    url: this.endpoint,
                    dataType: this.dataType,
                    method: this.method,
                    data: query

                }).then(( json ) => {
                    // core.cache.set( `partial--${this.id}`, json );

                    resolve( json );
                });
            }
        });
    }


    /**
     *
     * @instance
     * @description Render the view template
     * @memberof View
     * @method render
     *
     */
    render () {
        // Webpack es6Module { __esModule: true, default: f }
        const view = require( `../../views/${this.id}` );

        this.element[ 0 ].innerHTML = view.default( this );
    }


    /**
     *
     * @instance
     * @description Initialize controllers
     * @memberof View
     * @method exec
     *
     */
    exec () {
        this.controllers.image = new ImageController( this.element.find( core.config.lazyImageSelector ) );
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof View
     * @method destroy
     *
     */
    destroy () {
        if ( this.controllers.image ) {
            this.controllers.image.destroy();
            this.controllers.image = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
