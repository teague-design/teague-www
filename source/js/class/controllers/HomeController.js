import * as core from "../../core";



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
        this.unbindWheel();
        this.inMotion = true;

        // Scroll up ( rewind )
        if ( e.deltaY < 0 ) {
            if ( this.index !== 0 ) {
                this.index--;
            }

        // Scroll down ( advance )
        } else if ( this.index === this.length ) {
            this.index = 0;

        } else {
            this.index++;
        }

        this.transition();
    }
    resetWheel () {
        this.bindWheel();
        this.inMotion = false;
    }


    unload () {
        this.slices.removeClass( "is-active" );
    }


    transition () {
        // This needs to happen each time
        this.unload();

        if ( this.index === 0 ) {
            this.unloadAbout();
            this.loadReel();

        } else if ( this.index === 1 ) {
            this.unloadReel();
            this.unloadDiscover();
            this.loadAbout();

        } else if ( this.index === 2 ) {
            this.unloadAbout();
            this.unloadStories();
            this.loadDiscover();

        } else if ( this.index === 3 ) {
            this.unloadDiscover();
            this.loadStories();
        }
    }


    loadReel () {
        const slice = this.slices.eq( 0 ).addClass( "is-active" );
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
    unloadReel () {
        const slice = this.slices.eq( 0 );
        const mark = slice.find( ".js-home-reel-mark" );
        const desc = slice.find( ".js-home-reel-desc" );
        const cta = slice.find( ".js-home-reel-cta" );
        const ex = slice.find( ".js-home-reel-ex" );
        const video = slice.find( ".js-home-reel-video" );

        desc.removeClass( "is-anim" );
        cta.removeClass( "is-anim" ).off( "click" );
        ex.removeClass( "is-anim" ).off( "click" );
        mark.removeClass( "is-full is-half" );
        video.removeClass( "is-fs" );
    }


    loadAbout () {
        const slice = this.slices.eq( 1 ).addClass( "is-active" );
        const mark = slice.find( ".js-home-about-mark" );
        const desc = slice.find( ".js-home-about-desc" );

        mark.addClass( "is-expand" );
        desc.addClass( "is-anim" );

        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    unloadAbout () {
        const slice = this.slices.eq( 1 );
        const mark = slice.find( ".js-home-about-mark" );
        const desc = slice.find( ".js-home-about-desc" );

        mark.removeClass( "is-expand" );
        desc.removeClass( "is-anim" );
    }


    loadDiscover () {
        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    unloadDiscover () {}


    loadStories () {
        setTimeout(() => {
            this.resetWheel();

        }, 2000 );
    }
    unloadStories () {}


    destroy () {
        this.unbindWheelF();
        this.unbindWheel();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default HomeController;
