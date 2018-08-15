import log from "../../core/log";
import emitter from "../../core/emitter";


/**
 *
 * @public
 * @class Tracker
 * @classdesc Handles Google and Hubspot page tracking.
 * @memberof core
 *
 */
class Tracker {
    constructor () {
        emitter.on( "app--trackpageview", this.track.bind( this ) );

        log( "[Tracker initialized]" );
    }


    track ( doc ) {
        log( "[Tracker::trackpageview]", window.location.href );

        // Google Analytics
        // https://developers.google.com/analytics/devguides/collection/analyticsjs/sending-hits
        if ( typeof window.ga === "function" ) {
            window.ga( "send", "pageview", window.location.href );
        }

        // Hubspot Analytics
        // https://developers.hubspot.com/docs/methods/tracking_code_api/set_page_path
        // https://developers.hubspot.com/docs/methods/tracking_code_api/track_page_view
        if ( window._hsq ) {
            window._hsq.push( ["trackPageView"] );
        }

        // Document title
        this.setDocumentTitle( doc.data.title );
    }


    setDocumentTitle ( title ) {
        document.title = title;
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Tracker;
