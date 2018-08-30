import * as core from "../../core";
import ResizeController from "properjs-resizecontroller";
import ScrollController from "properjs-scrollcontroller";
import scroll2 from "properjs-scroll2";
import Easing from "properjs-easing";



/**
 *
 * @public
 * @class HomeController
 * @param {Hobo} element The homepage module
 * @classdesc Handles homepage stuff...
 *
 */
class HomeController {
    constructor ( element ) {
        this.element = element;
        this.slices = this.element.find( ".js-slice" );
        this.index = 0;
        this.length = this.slices.length;
        this.inMotion = true;
        this.isDisabled = false;
        this._onMouseWheel = this.onMouseWheel.bind( this );
        this._onMouseWheelF = this.onMouseWheelF.bind( this );
        this._loadFunc = null;
        this._unloadFunc = null;
        this._resizer = new ResizeController();
        this._scroller = new ScrollController();

        this.bindWheelF();
        this.bindWheel();
        this.transition();
    }


    onMouseWheelF ( e ) {
        e.preventDefault();
        return false;
    }
    onMouseWheel ( e ) {
        if ( !this.inMotion && !this.isDisabled ) {
            this.handleWheel( e );
        }
    }
    bindScroll () {
        this.unbindWheel();
        this.unbindWheelF();

        scroll2({
            y: this._scroller.getScrollMax(),
            ease: Easing.easeOutCubic,
            duration: 500
        });

        this._scroller.on( "scroll", () => {
            const scrollY = this._scroller.getScrollY();

            if ( scrollY <= 0 ) {
                this.unbindScroll();
            }
        });
    }
    bindWheelF () {
        core.dom.doc.on( "DOMMouseScroll mousewheel", this._onMouseWheelF );
    }
    bindWheel () {
        core.dom.doc.on( "DOMMouseScroll mousewheel", this._onMouseWheel );
    }
    unbindScroll () {
        this._scroller.off( "scroll" );
        this.bindWheelF();
        this.bindWheel();
    }
    unbindWheelF () {
        core.dom.doc.off( "DOMMouseScroll mousewheel", this._onMouseWheelF );
    }
    unbindWheel () {
        core.dom.doc.off( "DOMMouseScroll mousewheel", this._onMouseWheel );
    }
    handleWheel ( e ) {
        // Scroll up ( rewind )
        if ( e.deltaY < 0 ) {
            if ( this.index !== 0 ) {
                if ( this._unloadFunc ) {
                    this._unloadFunc();
                }
                this.index--;
                this.transition();
            }

        // Scroll down ( advance )
        } else if ( e.deltaY > 0 ) {
            if ( this.index !== (this.length - 1) ) {
                if ( this._unloadFunc ) {
                    this._unloadFunc();
                }
                this.index++;
                this.transition();

            // Enable page scroll again
            } else {
                this.bindScroll();
            }
        }
    }
    resetWheel () {
        this.bindWheel();
        this.inMotion = false;
    }


    unload () {
        this.slices.removeClass( "is-active" );
    }
    transition () {
        this.inMotion = true;
        this.unbindWheel();
        this.unload();

        const slice = this.slices.eq( this.index );
        const data = slice.data();

        this._loadFunc = this[ `${data.prop}_load` ].bind( this );
        this._unloadFunc = this[ `${data.prop}_unload` ].bind( this );
        this._loadFunc();
    }


    home_reel_load () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const mark = slice.find( ".js-home-reel-mark" );
        const desc = slice.find( ".js-home-reel-desc" );
        const cta = slice.find( ".js-home-reel-cta" );
        const ex = slice.find( ".js-home-reel-ex" );
        const video = slice.find( ".js-home-reel-video" );
        const videoInstance = video.find( ".js-video" ).data().Video;

        mark.addClass( "is-full" );
        core.dom.html.removeClass( "is-theme-black" ).addClass( "is-theme-white" );

        cta.on( "click", () => {
            this.isDisabled = true;
            desc.removeClass( "is-anim" );
            cta.removeClass( "is-anim" );
            ex.addClass( "is-anim" );
            mark.removeClass( "is-half" );
            video.addClass( "is-fs" );
            videoInstance.toggleSound();
        });

        ex.on( "click", () => {
            this.isDisabled = false;
            desc.addClass( "is-anim" );
            cta.addClass( "is-anim" );
            ex.removeClass( "is-anim" );
            mark.addClass( "is-half" );
            video.removeClass( "is-fs" );

            if ( !videoInstance.isMuted ) {
                videoInstance.toggleSound();
            }
        });

        setTimeout(() => {
            mark.removeClass( "is-full" ).addClass( "is-half" );

        }, 2000 );

        setTimeout(() => {
            desc.addClass( "is-anim" );
            cta.addClass( "is-anim" );

        }, 2500 );

        setTimeout(() => {
            this.resetWheel();

        }, 3000 );
    }
    home_reel_unload () {
        const slice = this.slices.eq( this.index );
        const mark = slice.find( ".js-home-reel-mark" );
        const desc = slice.find( ".js-home-reel-desc" );
        const cta = slice.find( ".js-home-reel-cta" );
        const ex = slice.find( ".js-home-reel-ex" );
        const video = slice.find( ".js-home-reel-video" );

        desc.addClass( "is-animo" );
        cta.removeClass( "is-anim" ).off( "click" );
        ex.removeClass( "is-anim" ).off( "click" );
        mark.removeClass( "is-full is-half" );
        video.removeClass( "is-fs" );

        setTimeout(() => {
            desc.removeClass( "is-anim is-animo" );

        }, 1000 );
    }


    home_about_load () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-about-desc" );
        const image1 = slice.find( ".image:nth-child(1)" );
        const image2 = slice.find( ".image:nth-child(2)" );
        const rect1 = slice.find( "rect:nth-child(3)" );
        const rect2 = slice.find( "rect:nth-child(4)" );
        let image2Bounds = image2[ 0 ].getBoundingClientRect();
        let image1Bounds = image1[ 0 ].getBoundingClientRect();
        let rect1Bounds = rect1[ 0 ].getBoundingClientRect();
        let rect2Bounds = rect2[ 0 ].getBoundingClientRect();
        const onResize = () => {
            image2Bounds = image2[ 0 ].getBoundingClientRect();
            image1Bounds = image1[ 0 ].getBoundingClientRect();
            rect1Bounds = rect1[ 0 ].getBoundingClientRect();
            rect2Bounds = rect2[ 0 ].getBoundingClientRect();

            image1[ 0 ].style.clipPath = `inset(
                ${0}px
                42vw
                ${window.innerHeight - rect1Bounds.bottom - (window.innerWidth * 0.03)}px
                ${0}px
            )`;
            image2[ 0 ].style.clipPath = `inset(
                ${rect2Bounds.top - image2Bounds.top}px
                ${0}px
                ${window.innerHeight - rect2Bounds.bottom}px
                ${0}px
            )`;
        };

        this._resizer.on( "resize", onResize );

        /* values are from-top, from-right, from-bottom, from-left */
        image1[ 0 ].style.clipPath = `inset(
            ${rect1Bounds.top - image1Bounds.top}px
            ${window.innerWidth - rect1Bounds.width - rect1Bounds.left}px
            ${window.innerHeight - rect1Bounds.bottom}px
            ${0}px
        )`;
        image2[ 0 ].style.clipPath = `inset(
            ${rect2Bounds.top - image2Bounds.top}px
            ${window.innerWidth - rect2Bounds.width - rect2Bounds.left}px
            ${window.innerHeight - rect2Bounds.bottom}px
            ${0}px
        )`;

        desc.addClass( "is-anim" );
        core.dom.html.removeClass( "is-theme-black" ).addClass( "is-theme-white" );

        setTimeout(() => {
            onResize();

        }, 10 );

        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    home_about_unload () {
        const slice = this.slices.eq( this.index );
        const desc = slice.find( ".js-home-about-desc" );
        const image1 = slice.find( ".image:nth-child(1)" );
        const image2 = slice.find( ".image:nth-child(2)" );
        const rect1 = slice.find( "rect:nth-child(3)" );
        const rect2 = slice.find( "rect:nth-child(4)" );
        const image2Bounds = image2[ 0 ].getBoundingClientRect();
        const image1Bounds = image1[ 0 ].getBoundingClientRect();
        const rect1Bounds = rect1[ 0 ].getBoundingClientRect();
        const rect2Bounds = rect2[ 0 ].getBoundingClientRect();

        this._resizer.off( "resize" );

        /* values are from-top, from-right, from-bottom, from-left */
        image1[ 0 ].style.clipPath = `inset(
            ${0}px
            100vw
            ${window.innerHeight - rect1Bounds.bottom - (window.innerWidth * 0.03)}px
            ${0}px
        )`;
        image2[ 0 ].style.clipPath = `inset(
            ${rect2Bounds.top - image2Bounds.top}px
            ${0}px
            ${window.innerHeight - rect2Bounds.bottom}px
            20vw
        )`;

        desc.addClass( "is-animo" );

        setTimeout(() => {
            /* values are from-top, from-right, from-bottom, from-left */
            image1[ 0 ].style.clipPath = `inset(
                ${rect1Bounds.top - image1Bounds.top}px
                ${window.innerWidth - rect1Bounds.width - rect1Bounds.left}px
                ${window.innerHeight - rect1Bounds.bottom}px
                ${0}px
            )`;
            image2[ 0 ].style.clipPath = `inset(
                ${rect2Bounds.top - image2Bounds.top}px
                ${window.innerWidth - rect2Bounds.width - rect2Bounds.left}px
                ${window.innerHeight - rect2Bounds.bottom}px
                ${0}px
            )`;

            desc.removeClass( "is-anim is-animo" );

        }, 1000 );
    }


    home_discover_load () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-discover-desc" );
        const image = slice.find( ".image" );
        const aboutSlice = this.slices.filter( "[data-prop='home_about']" );
        const aboutRect2 = aboutSlice.find( "rect:nth-child(4)" );
        const imageBounds = image[ 0 ].getBoundingClientRect();
        const aboutRect2Bounds = aboutRect2[ 0 ].getBoundingClientRect();

        /* values are from-top, from-right, from-bottom, from-left */
        image[ 0 ].style.clipPath = `inset(
            ${aboutRect2Bounds.top - imageBounds.top}px
            0px
            0px
            0px
        )`;

        desc.addClass( "is-anim" );
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );

        setTimeout(() => {
            /* values are from-top, from-right, from-bottom, from-left */
            image[ 0 ].style.clipPath = `inset(
                0px
                0px
                0px
                0px
            )`;

        }, 10 );

        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    home_discover_unload () {
        const slice = this.slices.eq( this.index );
        const desc = slice.find( ".js-home-discover-desc" );
        const image = slice.find( ".image" );
        const storiesSlice = this.slices.filter( "[data-prop='home_stories']" );
        const storiesImage = storiesSlice.find( ".image" ).first();
        const storiesImageBounds = storiesImage[ 0 ].getBoundingClientRect();
        const aboutSlice = this.slices.filter( "[data-prop='home_about']" );
        const aboutRect2 = aboutSlice.find( "rect:nth-child(4)" );
        const aboutRect2Bounds = aboutRect2[ 0 ].getBoundingClientRect();

        image[ 0 ].style.width = `${storiesImageBounds.width}px`;
        image[ 0 ].style.height = `${storiesImageBounds.height}px`;
        image[ 0 ].style.top = `${storiesImageBounds.top}px`;
        image[ 0 ].style.left = `${storiesImageBounds.left}px`;

        desc.addClass( "is-animo" );

        setTimeout(() => {
            image[ 0 ].style.width = null;
            image[ 0 ].style.height = null;
            image[ 0 ].style.top = null;
            image[ 0 ].style.left = null;

        }, 500 );

        setTimeout(() => {
            const imageBounds = image[ 0 ].getBoundingClientRect();

            /* values are from-top, from-right, from-bottom, from-left */
            image[ 0 ].style.clipPath = `inset(
                ${aboutRect2Bounds.top - imageBounds.top}px
                0px
                0px
                0px
            )`;

            image.removeClass( "is-animno" );
            desc.removeClass( "is-anim is-animo" );

        }, 1000 );
    }


    home_stories_load () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-stories-desc" );

        desc.addClass( "is-anim" );
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );

        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    home_stories_unload () {
        const slice = this.slices.eq( this.index );
        const desc = slice.find( ".js-home-stories-desc" );

        desc.removeClass( "is-anim" );
    }


    destroy () {
        this.unbindWheelF();
        this.unbindWheel();

        this._resizer.off( "resize" );
        this._scroller.off( "scroll" );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default HomeController;
