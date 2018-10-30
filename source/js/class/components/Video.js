import * as core from "../../core";
import $ from "properjs-hobo";
import Controller from "properjs-controller";
import VideoFS from "./VideoFS";



/**
 *
 * @public
 * @global
 * @class Video
 * @classdesc Handle an HTML5 video.
 *
 */
class Video {
    constructor ( elem, data ) {
        this.elem = elem;
        this.elemData = data;
        this.wrap = this.elem.find( ".js-video-wrap" );
        this.node = this.elem.find( ".js-video-node" );
        this.uiEl = this.elem.find( ".js-video-ui" );
        this.ui = {
            pp: this.uiEl.find( ".js-video-pp" ),
            fs: this.uiEl.find( ".js-video-fs" ),
            sound: this.uiEl.find( ".js-video-sound" ),
            ellapsed: this.uiEl.find( ".js-video-ellapsed" )
        };
        this.isFallback = false;
        this.isPlaying = false;
        this.isReadyState = false;
        this.isToggledPlayback = false;
        this.videoFS = null;

        // Store instance with element...
        this.elem.data( "Video", this );

        // Vimeo without CMS mobile alternative
        if ( this.elemData.json.vimeo ) {
            this.vimeoId = this.elemData.json.vimeo.split( "/" ).pop().replace( /\//g, "" );
            this.fetch().then(( json ) => {
                this.vimeoData = json;
                this.vimeo = this.getVimeoSource( json.files );
                this.source = this.vimeo.link;
                this.width = this.vimeo.width;
                this.height = this.vimeo.height;
                this.wrapit();
                this.load();
            });
        }
    }


    fetch () {
        return $.ajax({
            url: `/api/vimeo/${this.vimeoId}`,
            method: "GET",
            dataType: "json"
        });
    }


    wrapit () {
        // Aspect Ratio
        if ( this.wrap.length ) {
            this.wrap[ 0 ].style.paddingBottom = `${this.height / this.width * 100}%`;
        }
    }


    load () {
        this.node.on( "loadedmetadata", () => {
            this.isReadyState = true;
            
            if ( !this.width || !this.height ) {
                this.width = this.node[ 0 ].videoWidth;
                this.height = this.node[ 0 ].videoHeight;
                this.wrapit();
            }

            // Basic events
            this.events();

            // UI only events
            if ( this.uiEl.length ) {
                this.uiEvents();
            }

            if ( this.elemData.auto ) {
                this.automate();
            }
        });

        // Video source
        this.node[ 0 ].src = this.source;

        // Preload video
        this.node[ 0 ].load();
    }


    automate () {
        this.controller = new Controller();
        this.controller.go(() => {
            if ( this.isToggledPlayback ) {
                this.controller.stop();
                return;
            }

            if ( core.util.isElementVisible( this.elem[ 0 ] ) && !this.isPlaying ) {
                this.play( "Autoplay" );

            } else if ( !core.util.isElementVisible( this.elem[ 0 ] ) && this.isPlaying ) {
                this.pause( "Autopause" );
            }
        });
    }


    events () {
        this.node.on( "play", () => {
            this.isPlaying = true;
            this.elem.addClass( "is-playing" ).removeClass( "is-paused" );
        });

        this.node.on( "pause", () => {
            this.isPlaying = false;
            this.elem.addClass( "is-paused" ).removeClass( "is-playing" );
        });

        this.node.on( "ended", () => {
            this.isPlaying = false;
            this.elem.removeClass( "is-playing is-paused" );
        });
    }


    uiEvents () {
        this.wrap.on( "click", () => {
            this.togglePlay();
        });

        this.ui.pp.on( "click", () => {
            this.togglePlay();
        });

        this.ui.sound.on( "click", () => {
            this.toggleSound();
        });

        this.ui.fs.on( "click", () => {
            if ( this.isFsMode() ) {
                this.exitFsMode();

            } else {
                this.enterFsMode();
            }
        });

        this.node.on( "timeupdate", () => {
            this.ui.ellapsed[ 0 ].style.width = `${this.node[ 0 ].currentTime / this.node[ 0 ].duration * 100}%`;
        });
    }


    fallbackHandler () {
        this.destroy();
        this.isFallback = true;

        const picture = this.getVimeoPicture( this.vimeoData.pictures );

        this.elem[ 0 ].innerHTML = this.elemData.fs ? `<div class="video__pic js-video-pic -cover" data-img-src="${picture.link}"></div>` : `<img class="video__img js-video-pic" data-img-src="${picture.link}" />`;

        core.util.loadImages( this.elem.find( ".js-video-pic" ), core.util.noop );

        core.dom.body.find( ".js-home-reel-cta" ).remove();
    }


    getVimeoPicture ( pictures ) {
        const min = 640;
        const pics = pictures.sizes.filter(( size ) => {
            return (size.width >= min);

        }).sort( ( a, b ) => {
            return ( b.width < a.width ) ? 1 : -1;
        });

        return pics[ 0 ];
    }


    getVimeoSource ( files ) {
        let hds = files.filter( ( file ) => file.quality === "hd" );
        let sds = files.filter( ( file ) => file.quality === "sd" );
        let hd = null;
        let sd = null;

        // HD sort highest quality to the top
        hds = hds.sort( ( a, b ) => {
            return ( b.width > a.width ) ? 1 : -1;
        });

        // SD sort lower quality to the top ( come on man, mobile devices and shit )
        sds = sds.sort( ( a, b ) => {
            return ( b.width < a.width ) ? 1 : -1;
        });

        // HD use 1280 if window isn't even large enough for proper 1920
        if ( hds.length > 1 && window.innerWidth <= 1680 ) {
            hd = hds[ 1 ];

        } else {
            hd = hds[ 0 ];
        }

        // SD use lowest quality as a default
        sd = sds[ 0 ];

        // core.log( "Video HD", hd.width, hd );
        // core.log( "Video SD", sd.width, sd );

        return (core.detect.isDevice() ? sd : hd);
    }


    toggleSound () {
        if ( !this.isMuted ) {
            this.isMuted = true;
            this.node[ 0 ].muted = true;
            this.elem.addClass( "is-muted" );

        } else {
            this.isMuted = false;
            this.node[ 0 ].muted = false;
            this.elem.removeClass( "is-muted" );
        }
    }


    togglePlay () {
        this.isToggledPlayback = true;

        if ( !this.isPlaying ) {
            this.play( "CLICK PLAY VIDEO" );

        } else {
            this.pause( "CLICK PAUSE VIDEO" );
        }
    }


    enterFsMode () {
        if ( this.node[ 0 ].requestFullscreen ) {
            this.node[ 0 ].requestFullscreen();

        } else if ( this.node[ 0 ].webkitRequestFullscreen ) {
            this.node[ 0 ].webkitRequestFullscreen();

        } else if ( this.node[ 0 ].mozRequestFullScreen ) {
            this.node[ 0 ].mozRequestFullScreen();

        } else if ( this.node[ 0 ].msRequestFullscreen ) {
            this.node[ 0 ].msRequestFullscreen();
        }
    }


    exitFsMode () {
        if ( document.exitFullscreen ) {
            document.exitFullscreen();

        } else if ( document.webkitExitFullscreen ) {
            document.webkitExitFullscreen();

        } else if ( document.mozCancelFullScreen ) {
            document.mozCancelFullScreen();

        } else if ( document.msExitFullscreen ) {
            document.msExitFullscreen();
        }
    }


    isFsMode () {
        return (
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }


    play ( msg ) {
        if ( this.isFallback ) {
            return this;
        }

        if ( this.isPlaying ) {
            return this;
        }

        this.node[ 0 ].play()
            .then(() => {
                // FS ?
                if ( this.elemData.fs && !this.videoFS ) {
                    this.videoFS = new VideoFS( this );
                }

            }).catch(() => {
                this.fallbackHandler();
            });
        core.log( msg || "PLAY VIDEO" );
    }


    pause ( msg ) {
        if ( this.isFallback ) {
            return this;
        }

        if ( !this.isPlaying ) {
            return this;
        }

        this.node[ 0 ].pause();
        core.log( msg || "PAUSE VIDEO" );
    }


    destroy () {
        if ( this.isFallback ) {
            return this;
        }

        if ( this.controller ) {
            this.controller.stop();
            this.controller = null;
        }

        if ( this.videoFS ) {
            this.videoFS.destroy();
            this.videoFS = null;
        }

        this.wrap.off();
        this.node.off();
        this.ui.pp.off();
        this.ui.fs.off();
        this.ui.sound.off();

        if ( this.node && this.node.length ) {
            this.node[ 0 ].src = "";
            this.node.off().remove();
            delete this.node;
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Video;
