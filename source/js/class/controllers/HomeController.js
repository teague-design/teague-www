import * as core from "../../core";
import ResizeController from "properjs-resizecontroller";
import ScrollController from "properjs-scrollcontroller";



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
        this.footer = core.dom.body.find( ".js-footer" );
        this.slices = this.element.find( ".js-slice" );
        this.index = 0;
        this.length = this.slices.length;
        this.isDisabled = false;
        this.isWheel = false;
        this.wheelTime = 200;
        this._onMouseWheel = this.onMouseWheel.bind( this );
        this._onMouseWheelF = this.onMouseWheelF.bind( this );
        this._loadFunc = null;
        this._unloadFunc = null;
        this._resizer = new ResizeController();
        this._scroller = new ScrollController();
        this._timeout = null;
        this._clipPath = ("-webkit-clip-path" in this.element[ 0 ].style ? "-webkit-clip-path" : "clipPath");

        if ( core.detect.isDevice() ) {
            core.dom.html.addClass( "is-home-controller" );
            this.element.addClass( "home--mobilized js-home--mobilized" );
            this.handleMobile();

        } else {
            core.dom.html.addClass( "is-not-ready is-home-controller" );
            // Always bind "EFF" first
            this.bindWheelF();
            this.bindWheel();
            this.transition();
        }
    }


    handleMobile () {
        const onMobileScroll = () => {
            let isHit = false;

            this.slices.forEach(( el, i ) => {
                if ( !isHit ) {
                    const slice = this.slices.eq( i );
                    const data = slice.data();
                    const loadFunc = this[ `${data.prop}_load_mobile` ].bind( this );
                    const unloadFunc = this[ `${data.prop}_unload_mobile` ].bind( this );

                    if ( core.util.isElementVisible( el ) ) {
                        isHit = true;
                        loadFunc();

                    } else {
                        unloadFunc();
                    }
                }
            });
        };

        this._scroller.on( "scroll", onMobileScroll );
        onMobileScroll();
    }


    clearTimeout () {
        try {
            clearTimeout( this._timeout );

        } catch ( err ) {
            core.log( "warn", err );
        }
    }
    onMouseWheelF ( e ) {
        this.clearTimeout();
        this._timeout = setTimeout(() => {
            this.isWheel = false;

        }, this.wheelTime );

        e.preventDefault();
        return false;
    }
    onMouseWheel ( e ) {
        if ( !this.isWheel && !this.isDisabled ) {
            this.isWheel = true;
            this.handleWheel( e );
        }
    }
    bindWheelF () {
        core.dom.doc.on( "DOMMouseScroll mousewheel", this._onMouseWheelF );
    }
    bindWheel () {
        core.dom.doc.on( "DOMMouseScroll mousewheel", this._onMouseWheel );
    }
    unbindWheelF () {
        core.dom.doc.off( "DOMMouseScroll mousewheel", this._onMouseWheelF );
    }
    unbindWheel () {
        core.dom.doc.off( "DOMMouseScroll mousewheel", this._onMouseWheel );
    }
    handleWheel ( e ) {
        const delta = e.deltaY || e.detail;

        // Scroll up ( rewind )
        // Could check deltaY === -1
        if ( delta < 0 ) {
            if ( this.index !== 0 ) {
                if ( this._unloadFunc ) {
                    this._unloadFunc();
                }
                this.index--;
                this.transition();
            }

        // Scroll down ( advance )
        // Could check deltaY === 1
        } else if ( delta > 0 ) {
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
    bindScroll () {
        let isFooter = false;

        this.isWheel = false;
        this.unbindWheel();
        this.unbindWheelF();
        core.dom.html.removeClass( "is-not-ready" );

        this._scroller.on( "scroll", () => {
            const isZero = (this._scroller.getScrollY() <= 0);
            const boundsF = this.footer[ 0 ].getBoundingClientRect();

            if ( ((boundsF.height + boundsF.y) >= window.innerHeight) && !isFooter ) {
                isFooter = true;
            }

            if ( isZero && isFooter ) {
                this.unbindScroll();
                this._timeout = setTimeout(() => {
                    core.dom.html.addClass( "is-not-ready" );
                    this.bindWheelF();
                    this.bindWheel();

                }, 1000 );
            }
        });
    }
    unbindScroll () {
        this._scroller.off( "scroll" );
    }


    transition () {
        this.slices.removeClass( "is-active" );

        const slice = this.slices.eq( this.index );
        const data = slice.data();

        this._loadFunc = this[ `${data.prop}_load` ].bind( this );
        this._unloadFunc = this[ `${data.prop}_unload` ].bind( this );
        this._loadFunc();
    }


    home_reel_load_mobile () {
        core.dom.html.removeClass( "is-theme-black" ).addClass( "is-theme-white" );
    }
    home_reel_unload_mobile () {}
    home_reel_load () {
        this.home_reel_load_mobile();
        this.home_reel_load_();
    }
    home_reel_load_ () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const mark = slice.find( ".js-home-reel-mark" );
        const desc = slice.find( ".js-home-reel-desc" );
        const cta = slice.find( ".js-home-reel-cta" );
        const ex = slice.find( ".js-home-reel-ex" );
        const video = slice.find( ".js-home-reel-video" );
        const videoInstance = video.find( ".js-video" ).data().Video;

        mark.addClass( "is-full" );

        cta.on( "click", () => {
            this.isDisabled = true;
            desc.removeClass( "is-anim" );
            cta.removeClass( "is-anim" );
            ex.addClass( "is-anim" );
            mark.removeClass( "is-half" );
            video.addClass( "is-fs" );
            videoInstance.toggleSound();

        }).on( "mouseenter", () => {
            slice.addClass( "is-cta" );

        }).on( "mouseleave", () => {
            slice.removeClass( "is-cta" );
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


    home_about_load_mobile () {
        core.dom.html.removeClass( "is-theme-black" ).addClass( "is-theme-white" );
    }
    home_about_unload_mobile () {}
    home_about_load () {
        this.home_about_load_mobile();
        this.home_about_load_();
    }
    home_about_load_ () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-about-desc" );
        const cta = slice.find( ".js-home-about-cta .link" );
        const image1 = slice.find( ".js-lazy-image" ).first();
        const image2 = slice.find( ".js-lazy-image" ).last();
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

            image1[ 0 ].style[ this._clipPath ] = `inset(
                ${0}px
                42vw
                ${window.innerHeight - rect1Bounds.bottom - (window.innerWidth * 0.03)}px
                ${0}px
            )`;
            image2[ 0 ].style[ this._clipPath ] = `inset(
                ${rect2Bounds.top - image2Bounds.top}px
                ${0}px
                ${window.innerHeight - rect2Bounds.bottom}px
                ${0}px
            )`;
        };

        this._resizer.on( "resize", onResize );

        /* values are from-top, from-right, from-bottom, from-left */
        image1[ 0 ].style[ this._clipPath ] = `inset(
            ${rect1Bounds.top - image1Bounds.top}px
            ${window.innerWidth - rect1Bounds.width - rect1Bounds.left}px
            ${window.innerHeight - rect1Bounds.bottom}px
            ${0}px
        )`;
        image2[ 0 ].style[ this._clipPath ] = `inset(
            ${rect2Bounds.top - image2Bounds.top}px
            ${window.innerWidth - rect2Bounds.width - rect2Bounds.left}px
            ${window.innerHeight - rect2Bounds.bottom}px
            ${0}px
        )`;

        cta.on( "mouseenter", () => {
            slice.addClass( "is-cta" );

        }).on( "mouseleave", () => {
            slice.removeClass( "is-cta" );
        });

        desc.addClass( "is-anim" );

        setTimeout(() => {
            onResize();

        }, 10 );
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


    home_discover_load_mobile () {
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );
    }
    home_discover_unload_mobile () {}
    home_discover_load () {
        this.home_discover_load_mobile();
        this.home_discover_load_();
    }
    home_discover_load_ () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-discover-desc" );
        const cta = slice.find( ".js-home-discover-cta .link" );
        const image = slice.find( ".image" );
        const aboutSlice = this.slices.filter( "[data-prop='home_about']" );
        const aboutRect2 = aboutSlice.find( "rect:nth-child(4)" );
        const imageBounds = image[ 0 ].getBoundingClientRect();
        const aboutRect2Bounds = aboutRect2[ 0 ].getBoundingClientRect();

        /* values are from-top, from-right, from-bottom, from-left */
        image[ 0 ].style[ this._clipPath ] = `inset(
            ${aboutRect2Bounds.top - imageBounds.top}px
            0px
            0px
            0px
        )`;

        cta.on( "mouseenter", () => {
            slice.addClass( "is-cta" );

        }).on( "mouseleave", () => {
            slice.removeClass( "is-cta" );
        });

        desc.addClass( "is-anim" );
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );

        setTimeout(() => {
            /* values are from-top, from-right, from-bottom, from-left */
            image[ 0 ].style[ this._clipPath ] = `inset(
                0px
                0px
                0px
                0px
            )`;

        }, 10 );
    }
    home_discover_unload () {
        const slice = this.slices.eq( this.index );
        const desc = slice.find( ".js-home-discover-desc" );
        const image = slice.find( ".image" );
        const storiesSlice = this.slices.filter( "[data-prop='home_stories']" );
        const storiesImage = storiesSlice.find( ".js-slider-item.is-active" );
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


    home_stories_load_mobile () {
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );
    }
    home_stories_unload_mobile () {}
    home_stories_load () {
        this.home_stories_load_mobile();
        this.home_stories_load_();
    }
    home_stories_load_ () {
        const slice = this.slices.eq( this.index ).addClass( "is-active" );
        const desc = slice.find( ".js-home-stories-desc" );

        desc.addClass( "is-anim" );
        core.dom.html.removeClass( "is-theme-white" ).addClass( "is-theme-black" );
    }
    home_stories_unload () {
        const slice = this.slices.eq( this.index );
        const desc = slice.find( ".js-home-stories-desc" );

        desc.removeClass( "is-anim" );
    }


    destroy () {
        this.unbindWheelF();
        this.unbindWheel();
        this.unbindScroll();

        this._resizer.destroy();
        this._scroller.destroy();

        core.dom.html.removeClass( "is-not-ready is-home-controller" );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default HomeController;
