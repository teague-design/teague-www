import ResizeController from "properjs-resizecontroller";
import * as core from "../../core";


/**
 *
 * @public
 * @global
 * @class VideoFS
 * @param {Element} element The dom element to work with.
 * @classdesc Handle fullbleed cover video.
 *
 */
class VideoFS {
    constructor ( video ) {
        this.video = video;
        this.videoRatio = this.video.width / this.video.height;
        this.resizer = new ResizeController();

        this.bind();
    }


    bind () {
        this._onResizeHandler = this.resizeHandler.bind( this );

        this.resizer.on( "resize", this._onResizeHandler );

        this.resizeHandler();
    }


    resizeHandler () {
        const nodeRect = { width: window.innerWidth, height: window.innerHeight };
        const windowRatio = nodeRect.width / nodeRect.height;
        const adjustRatio = this.videoRatio / windowRatio;
        let videoWidth = null;

        if ( windowRatio < this.videoRatio ) {
            videoWidth = nodeRect.width * adjustRatio;

        } else {
            videoWidth = nodeRect.width;
        }

        this.video.node[ 0 ].style.width = core.util.px( videoWidth );
        this.video.node[ 0 ].width = videoWidth;
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof VideoFS
     * @method destroy
     *
     */
    destroy () {
        this.resizer.off( "resize", this._onResizeHandler );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default VideoFS;
