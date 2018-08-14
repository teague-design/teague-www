import Video from "../components/Video";



/**
 *
 * @public
 * @class VideoController
 * @param {Hobo} element The video container
 * @classdesc Handles video playback
 *
 */
class VideoController {
    constructor ( elements ) {
        this.elements = elements;
        this.instances = [];

        this.init();
    }


    init () {
        this.elements.forEach(( el, i ) => {
            const elem = this.elements.eq( i );
            const data = elem.data();

            this.instances.push( new Video( elem, data ) );
        });
    }


    destroy () {
        this.instances.forEach(( instance ) => {
            instance.destroy();
            instance = null;
        });
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default VideoController;
