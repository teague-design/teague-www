// import * as core from "../../core";
import loadJS from "fg-loadjs";
import loadCSS from "fg-loadcss";
// import $ from "properjs-hobo";


/**
 *
 * @public
 * @global
 * @class Mapbox
 * @classdesc Handle loading a Javascript map...
 *
 */
class Mapbox {
    constructor ( element ) {
        this.element = element;
        this.marker = this.element.find( ".js-mapbox-marker" ).detach();
        this.data = this.element.data();
        this.lngLat = this.data.latlng.reverse();
        this.map = null;
        this.mapMarker = null;
        this.api = {
            script: "//api.tiles.mapbox.com/mapbox-gl-js/v0.48.0/mapbox-gl.js",
            styles: "//api.tiles.mapbox.com/mapbox-gl-js/v0.48.0/mapbox-gl.css",
            token: "pk.eyJ1Ijoia2l0YWpjaHVrIiwiYSI6ImNqMzRxOXhnYzAxbG8ycHA2ZW9keXZtMGEifQ.xMItgdorzQWYZo3DIhqMeA"
        };

        if ( window.mapboxgl ) {
            this.ready();

        } else {
            this.load();
        }
    }


    load () {
        loadJS( this.api.script, () => this.ready() );
        loadCSS( this.api.styles );
    }


    ready () {
        window.mapboxgl.accessToken = this.api.token;
        this.init();
    }


    init () {
        this.map = new window.mapboxgl.Map({
            container: this.element[ 0 ],
            center: this.lngLat,
            scrollZoom: false,
            zoom: 16,
            style: "mapbox://styles/mapbox/dark-v9"
        });
        this.mapMarker = new window.mapboxgl.Marker( this.marker[ 0 ] );
        this.mapMarker.setLngLat( this.lngLat );
        this.mapMarker.addTo( this.map );
    }


    destroy () {
        this.map = null;
        this.mapMarker = null;
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Mapbox;
