import * as core from "../../core";
import $ from "properjs-hobo";
import ImageController from "../controllers/ImageController";
import AnimateController from "../controllers/AnimateController";
import paramalama from "paramalama";


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
    constructor ( elem, data ) {
        this.data = data;
        this.element = elem;
        this.id = this.data.uid;
        this.endpoint = this.data.url;
        this.query = paramalama( window.location.search );
        this.skips = this.data.skips ? this.data.skips.split( "|" ) : [];
        this.flags = this.data.flags ? this.data.flags.split( "|" ) : [];
        this.json = null;
        this.controllers = {};
        this.dataType = "json";
        this.method = "GET";

        // Store View instance for update(s)
        this.element.data( "View", this );

        // ajax = well, duh...
        this.query.ajax = 1;

        // clean = no queryString
        if ( this.data.clean ) {
            this.query = { clean: 1 };
        }

        // tag = queryString to add
        if ( this.data.tag ) {
            this.query.tag = this.data.tag;
        }

        // skips = queryString to ignore
        this.skips.forEach(( skip ) => {
            if ( this.query[ skip ] ) {
                delete this.query[ skip ];
            }
        });

        // flags = queryString to add
        this.flags.forEach(( flag ) => {
            this.query[ flag ] = 1;
        });

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
        this.load().then( this.done.bind( this ) );
    }


    done ( json ) {
        this.json = json;
        this.render();
        this.exec();
    }



    update ( json ) {
        this.json = json;
        this.destroy();
        this.render();
        this.exec();
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
            const cache = core.cache.get( this.id );
            const query = this.query || {};

            // Set these for Clutch API partial rendering
            // query.format = "html";
            // query.template = this.id;

            // Pre-render from cache
            if ( cache && this.data.cache ) {
                this.done( cache );
            }

            // Update render from AJAX
            $.ajax({
                url: this.endpoint,
                dataType: this.dataType,
                method: this.method,
                data: query

            }).then(( json ) => {
                // Update the cache from AJAX
                if ( this.data.cache ) {
                    core.cache.set( this.id, json );
                }

                resolve( json );
            });
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
        this.controllers.animate = new AnimateController( this.element, this.element.find( core.config.lazyAnimSelector ) );
        this.controllers.animate.start();
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

        if ( this.controllers.animate ) {
            this.controllers.animate.destroy();
            this.controllers.animate = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
