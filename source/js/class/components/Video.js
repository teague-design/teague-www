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
        this.ui = {
            pp: this.elem.find( ".js-video-pp" ),
            fs: this.elem.find( ".js-video-fs" ),
            sound: this.elem.find( ".js-video-sound" ),
            ellapsed: this.elem.find( ".js-video-ellapsed" )
        };
        this.isFallback = false;
        this.isPlaying = false;
        this.isReadyState = false;

        // Vimeo without CMS mobile alternative
        if ( this.elemData.json.vimeo && !core.detect.isDevice() ) {
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

        } else if ( this.elemData.json.video ) {
            this.source = this.getVideoSource();
            this.load();
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
        this.controller = new Controller();
        this.controller.go(() => {
            if ( this.node[ 0 ].readyState === 4 && !this.isReadyState ) {
                this.isReadyState = true;
                this.controller.stop();

                // Width / Height
                if ( !this.width || !this.height ) {
                    this.width = this.node[ 0 ].videoWidth;
                    this.height = this.node[ 0 ].videoHeight;
                    this.wrapit();
                }

                // FS ?
                if ( this.elemData.fs ) {
                    this.videoFS = new VideoFS( this );
                }

                // Basic events
                this.events();
            }
        });

        // Video source
        this.node[ 0 ].src = this.source;

        // Preload video
        this.node[ 0 ].load();
    }


    events () {
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

        this.node.on( "timeupdate", () => {
            this.ui.ellapsed[ 0 ].style.width = `${this.node[ 0 ].currentTime / this.node[ 0 ].duration * 100}%`;
        });
    }


    fallbackHandler () {
        this.destroy();
        this.isFallback = true;

        this.getVideoFallback().then(( imgData ) => {
            this.elem[ 0 ].innerHTML = `
                <div class="video__wrap js-video-wrap" style="padding-bottom:${imgData.height / imgData.width * 100}%;">
                    <img class="image js-lazy-image js-fallback-image" data-img-src="${imgData.url}" />
                </div>
            `;

            core.util.loadImages( this.elem.find( ".js-fallback-image" ) );
        });
    }


    getVideoFallback () {
        return new Promise(( resolve ) => {
            let imgData = null;

            // CMS image
            if ( this.elemData.json.fallback ) {
                resolve({
                    url: this.elemData.json.fallback.url,
                    width: this.elemData.json.fallback.dimensions.width,
                    height: this.elemData.json.fallback.dimensions.height
                });

            // Vimeo image ( already fetched )
            } else if ( this.elemData.json.vimeo && this.vimeoData ) {
                imgData = this.getVimeoImage( this.vimeoData.pictures );
                resolve({
                    url: imgData.link,
                    width: imgData.width,
                    height: imgData.height
                });

            // Vimeo image ( not fetched )
            } else if ( this.elemData.json.vimeo ) {
                this.fetch().then(( json ) => {
                    imgData = this.getVimeoImage( json.pictures );
                    resolve({
                        url: imgData.link,
                        width: imgData.width,
                        height: imgData.height
                    });
                });
            }
        });
    }


    getVideoSource () {
        return this.elemData.json.video.url;
    }


    getVimeoImage ( pictures ) {
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

        this.node[ 0 ].play().catch(() => {
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

        this.elem.off();

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
