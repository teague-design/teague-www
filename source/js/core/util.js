/**
 *
 * @public
 * @namespace util
 * @memberof core
 * @description Houses app-wide utility methods.
 *
 */
import $ from "properjs-hobo";
import ImageLoader from "properjs-imageloader";
import config from "./config";
import detect from "./detect";


/**
 *
 * @description Add pixel units when inline styling
 * @method px
 * @param {string} str The value to pixel-ify
 * @memberof core.util
 * @returns {string}
 *
 */
const px = function ( str ) {
    return `${str}px`;
};


/**
 *
 * @description Apply a translate3d transform
 * @method translate3d
 * @param {object} el The element to transform
 * @param {string|number} x The x value
 * @param {string|number} y The y value
 * @param {string|number} z The z value
 * @memberof core.util
 *
 */
const translate3d = function ( el, x, y, z ) {
    el.style[ detect.getPrefixed( "transform" ) ] = `translate3d( ${x}, ${y}, ${z} )`;
};


/**
 *
 * @description Module onImageLoadHander method, handles event
 * @method isElementLoadable
 * @param {object} el The DOMElement to check the offset of
 * @memberof core.util
 * @returns {boolean}
 *
 */
const isElementLoadable = function ( el ) {
    let ret = false;

    if ( el ) {
        const bounds = el.getBoundingClientRect();

        ret = ( bounds.top < (window.innerHeight * 2) );
    }

    return ret;
};


/**
 *
 * @description Module isElementVisible method, handles element boundaries
 * @method isElementVisible
 * @param {object} el The DOMElement to check the offsets of
 * @memberof core.util
 * @returns {boolean}
 *
 */
const isElementVisible = function ( el ) {
    let ret = false;

    if ( el ) {
        const bounds = el.getBoundingClientRect();

        ret = ( bounds.top < window.innerHeight && bounds.bottom > 0 );
    }

    return ret;
};


/**
 *
 * @description Fresh query to lazyload images on page
 * @method loadImages
 * @param {object} images Optional collection of images to load
 * @param {function} handler Optional handler for load conditions
 * @memberof core.util
 * @returns {ImageLoader}
 *
 */
const loadImages = function ( images, handler ) {
    // Normalize the handler
    handler = (handler || isElementLoadable);

    // Normalize the images
    images = (images || $( config.lazyImageSelector ));

    // Normalize for image asset data from CMS
    images.forEach(( el, i ) => {
        const elem = images.eq( i );
        const data = elem.data();
        const wrap = elem.closest( ".js-lazy-image-wrap" );
        const isMobile = ((data.imgJson && data.imgJson.mobile && data.imgJson.mobile.url) && (window.innerWidth <= config.mobileMediaHack) && detect.isDevice());
        const isTablet = ((data.imgJson && data.imgJson.tablet && data.imgJson.tablet.url) && (window.innerWidth <= config.tabletMediaHack) && detect.isDevice());
        let dims = ((data.imgJson && data.imgJson.dimensions) || null);

        // Normalize for mobile image asset if there is one
        if ( isMobile ) {
            dims = data.imgJson.mobile.dimensions;
            elem.attr( config.lazyImageAttr, data.imgJson.mobile.url );

        // Normalize for tablet image asset if there is one
        } else if ( isTablet ) {
            dims = data.imgJson.tablet.dimensions;
            elem.attr( config.lazyImageAttr, data.imgJson.tablet.url );
        }

        // Normalize the padding if dimensions exist
        if ( dims && wrap.length ) {
            wrap[ 0 ].style.paddingBottom = `${dims.height / dims.width * 100}%`;
        }
    });

    return new ImageLoader({
        elements: images,
        property: config.lazyImageAttr,
        executor: handler
    });
};


/**
 *
 * @description All true all the time
 * @method noop
 * @memberof core.util
 * @returns {boolean}
 *
 */
const noop = function () {
    return true;
};


/**
 *
 * @method getElementsInView
 * @memberof core.util
 * @param {Hobo} $nodes The collection to process
 * @param {function} executor Optional method to determin `in view`
 * @description Get elements within a loadable position on the page
 * @returns {Hobo}
 *
 */
const getElementsInView = function ( $nodes, executor ) {
    let i = $nodes.length;
    const ret = [];

    executor = (executor || isElementVisible);

    for ( i; i--; ) {
        if ( executor( $nodes[ i ] ) ) {
            ret.push( $nodes[ i ] );
        }
    }

    return $( ret );
};


/**
 *
 * @description Get the applied transition duration from CSS
 * @method getElementDuration
 * @param {object} el The DOMElement
 * @param {string} key The duration type to get eg `transition` or `animation`
 * @memberof util
 * @returns {number}
 *
 */
const getElementDuration = function ( el, key ) {
    let ret = 0;
    let duration = null;
    let isSeconds = false;
    let multiplyBy = 1000;

    key = key || "transition";

    if ( el ) {
        duration = getComputedStyle( el )[ detect.getPrefixed( `${key}-duration` ) ];
        isSeconds = duration.indexOf( "ms" ) === -1;
        multiplyBy = isSeconds ? 1000 : 1;

        ret = parseFloat( duration ) * multiplyBy;
    }

    return ret;
};


/**
 *
 * @method getDefaultHammerOptions
 * @memberof core.util
 * @description The default options for Hammer JS.
 *              Disables cssProps for non-touch experiences.
 * @returns {object}
 *
 */
const getDefaultHammerOptions = () => {
    return detect.isDevice() ? {} : {
        cssProps: {
            contentZoomingString: false,
            tapHighlightColorString: false,
            touchCalloutString: false,
            touchSelectString: false,
            userDragString: false,
            userSelectString: false
        }
    };
};


/**
 *
 * Get the applied transform values from CSS
 * @method getTransformValues
 * @param {object} el The DOMElement
 * @memberof util
 * @returns {object}
 *
 */
const getTransformValues = ( el ) => {
    if ( !el ) {
        return null;
    }

    const transform = window.getComputedStyle( el )[ detect.getPrefixed( "transform" ) ];
    const values = transform.replace( /matrix|3d|\(|\)|\s/g, "" ).split( "," );
    const ret = {};

    // No Transform
    if ( values[ 0 ] === "none" ) {
        ret.x = 0;
        ret.y = 0;
        ret.z = 0;

    // Matrix 3D
    } else if ( values.length === 16 ) {
        ret.x = parseFloat( values[ 12 ] );
        ret.y = parseFloat( values[ 13 ] );
        ret.z = parseFloat( values[ 14 ] );

    } else {
        ret.x = parseFloat( values[ 4 ] );
        ret.y = parseFloat( values[ 5 ] );
        ret.z = 0;
    }

    return ret;
};



/******************************************************************************
 * Export
*******************************************************************************/
export {
    px,
    noop,
    loadImages,
    translate3d,
    isElementLoadable,
    isElementVisible,
    getElementsInView,
    getElementDuration,
    getDefaultHammerOptions,
    getTransformValues
};
