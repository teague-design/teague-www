import * as core from "../../core";
import Hammer from "hammerjs";


/**
 *
 * @public
 * @global
 * @class Swiper
 * @param {Carousel} slider The slider to work with.
 * @classdesc Handle mobile swiping.
 *
 */
class Swiper {
    constructor ( slider ) {
        this.slider = slider;
        this.transform = null;

        this.bind();
    }


    isSwipeable () {
        return core.detect.isDevice();
    }


    bind () {
        this.swipe = new Hammer( this.slider.element[ 0 ], core.util.getDefaultHammerOptions() );
        this.swipe.on( "panstart", this.onpanstart.bind( this ) );
        this.swipe.on( "panmove", this.onpanmove.bind( this ) );
        this.swipe.on( "panend", this.onpanend.bind( this ) );
        this.swipe.on( "swipe", this.onswipe.bind( this ) );
    }


    onpanstart ( e ) {
        e.preventDefault();

        if ( this.isSwipeable() ) {
            this.transform = core.util.getTransformValues( this.slider.belt[ 0 ] );
            this.slider.belt.addClass( "is-panning" );
        }
    }


    onpanmove ( e ) {
        e.preventDefault();

        if ( this.isSwipeable() ) {
            core.util.translate3d(
                this.slider.belt[ 0 ],
                `calc(${this.transform.x}px + ${e.deltaX / 3}px)`,
                0,
                0
            );
        }
    }


    onpanend ( e ) {
        e.preventDefault();

        if ( this.isSwipeable() ) {
            this.slider.belt.removeClass( "is-panning" );
            this.slider.isPanning = true;
            this.slider.transition();
            this.slider.timeout();
        }
    }


    onswipe ( e ) {
        e.preventDefault();

        if ( this.isSwipeable() ) {
            this.slider.belt.removeClass( "is-panning" );

            if ( e.direction === Hammer.DIRECTION_LEFT && this.slider.data.index !== (this.slider.data.length - 1) ) {
                this.slider.advance();

            } else if ( e.direction === Hammer.DIRECTION_RIGHT && this.slider.data.index !== 0 ) {
                this.slider.rewind();
            }
        }
    }


    destroy () {
        if ( this.swipe ) {
            this.swipe.destroy();
            this.swipe = null;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Swiper;
