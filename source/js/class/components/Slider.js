import * as core from "../../core";
import $ from "properjs-hobo";
import ResizeController from "properjs-resizecontroller";
import Swiper from "./Swiper";


/**
 *
 * @public
 * @global
 * @class Slider
 * @param {Element} element The dom element to work with.
 * @classdesc Handle sliderzzzzzzz.
 *
 */
class Slider {
    constructor ( element ) {
        this.element = element;
        this.elemData = this.element.data();
        this.belt = this.element.find( ".js-slider-belt" );
        this.currs = this.element.find( ".js-slider-curr" );
        this.extraCurrs = this.element.find( ".js-slider-extra-curr" );
        this.items = this.element.find( ".js-slider-item" );
        this.prev = this.element.find( ".js-slider-prev" );
        this.next = this.element.find( ".js-slider-next" );
        this.data = {
            index: 0,
            length: this.currs.length
        };
        this.offsets = {
            home: {
                move: "(-50vw - 10vw)",
                coup: {
                    move: ( idx ) => {
                        return `calc(-${100 * idx}vw + ${parseInt( window.getComputedStyle( this.items[ idx ] )[ "margin-left" ], 10 ) * idx}px)`;
                    },
                    exec: () => {
                        return this.isHomeMobilized;
                    }
                }
            },
            enum: {
                move: "(-50vw - 10vw)",
                noop: {
                    move: ( idx ) => {
                        return `calc(-${this.items[ idx ].getBoundingClientRect().width * idx}px - ${idx * 10}vw)`;
                    },
                    width: 768
                }
            },
            edge: {
                move: "-100vw"
            },
            paddy: {
                move: "(-70vw - 10vw)"
            },
            about: {
                move: "(-30vw - 10vw)",
                noop: {
                    move: "(-50vw - 10vw)",
                    width: 1024
                },
                moop: {
                    move: ( idx ) => {
                        return `calc(-${this.element[ 0 ].getBoundingClientRect().width * idx}px - ${idx * 10}vw)`;
                    },
                    width: 640
                }
            },
            logos: {
                move: ( idx ) => {
                    return `calc(-${100 * idx}%)`;
                }
            },
            work: {
                move: "(-32vw - 10vw)",
                noop: {
                    move: "(-70vw - 10vw)",
                    width: 1024
                }
            },
            highs: {
                move: ( idx ) => {
                    return `calc(-15vw - ${idx * 30}vw - ${idx * 10}vw)`;
                },
                noop: {
                    move: ( idx ) => {
                        return `calc(-25vw - ${idx * 50}vw - ${idx * 10}vw)`;
                    },
                    width: 1024
                },
                moop: {
                    move: ( idx ) => {
                        return `calc(0vw - ${idx * 65}vw - ${idx * 10}vw)`;
                    },
                    width: 768
                }
            }
        };
        this.isHomeMobilized = core.dom.body.find( ".js-home--mobilized" ).length;
        this.isPanning = false;
        this.isMoving = false;
        this._spawnFunc = this[ `spawn_${this.elemData.spawn}` ].bind( this );
        this._swapFunc = this[ `swap_${this.elemData.spawn}` ].bind( this );
        this.swiper = new Swiper( this );

        this.init();
        this.bind();
        this._spawnFunc();
    }


    inMotion () {
        return (this.isMoving || this.isPanning);
    }


    spawn_enum_mobile () {
        this.spawn_home_mobile();
    }
    spawn_enum () {
        this.spawn_home();
    }
    swap_enum () {
        this.swap_home();
    }


    spawn_edge () {}
    swap_edge () {}


    spawn_paddy () {}
    swap_paddy () {}


    spawn_work () {}
    swap_work () {}


    spawn_about () {}
    swap_about () {}


    spawn_logos () {
        this.items.off( "click" );
    }
    swap_logos () {}


    spawn_highs () {
        this.ellapsed = this.element.find( ".js-slider-ellapsed" );
        this.pane = this.element.find( ".js-slider-pane" );
        this.timeline = this.element.find( ".js-slider-timeline" );
        this.onResizer = () => {
            this.pane[ 0 ].style.height = `${this.items[ 0 ].getBoundingClientRect().height}px`;
            this.swap_highs();
        };
        this.resizer = new ResizeController();
        this.resizer.on( "resize", this.onResizer );
        this.onResizer();
    }
    swap_highs () {
        const notch = this.currs.filter( ".is-active" );
        const notches = notch.parent();
        const notchBounds = notch[ 0 ].getBoundingClientRect();
        const notchesBounds = notches[ 0 ].getBoundingClientRect();
        const offsetLeft = notchBounds.left - notchesBounds.left;

        this.ellapsed[ 0 ].style.width = `calc(${offsetLeft}px)`;
        this.currs.forEach(( el, i ) => {
            const curr = this.currs.eq( i );

            if ( i < this.data.index ) {
                curr.addClass( "is-ellapsed" );

            } else {
                curr.removeClass( "is-ellapsed" );
            }
        });
    }


    spawn_home_mobile () {
        this.splashHeight = 0;
        this.splashItems.forEach(( el ) => {
            const bounds = el.getBoundingClientRect();

            if ( bounds.height > this.splashHeight ) {
                this.splashHeight = bounds.height;
            }
        });
        this.splash[ 0 ].style.height = `${this.splashHeight}px`;
    }
    spawn_home () {
        this.splash = this.element.find( ".js-slider-splash" );
        this.splashItems = this.element.find( ".js-slider-splash-item" );
        this.splashItems.first().addClass( "is-active" );

        if ( core.detect.isDevice() ) {
            this.spawn_home_mobile();
        }
    }
    swap_home () {
        this.splashItems.filter( ".is-active" ).addClass( "is-exit" );
        this.splashItems.eq( this.data.index ).addClass( "is-active" );

        setTimeout( () => {
            this.splashItems.filter( ".is-exit" ).removeClass( "is-exit is-active" );

        }, 500 );
    }


    init () {
        this.currs.first().addClass( "is-active" );
        this.items.first().addClass( "is-active" );

        if (this.extraCurrs.length) {
            this.extraCurrs.first().addClass( "is-active" );
        }
    }


    bind () {
        if ( this.prev.length && this.next.length ) {
            this.prev.on( "click", () => {
                this.rewind();
            });
            this.next.on( "click", () => {
                this.advance();
            });
        }
        this.currs.on( "click", this.onHitItem.bind( this ));
        this.items.on( "click", this.onHitItem.bind( this ));

        if (this.extraCurrs.length) {
            this.extraCurrs.on( "click", this.onHitItem.bind( this ));
        }
    }


    onHitItem ( e ) {
        const target = $( e.target );
        const index = parseInt( target.data().index, 10 );
        const canGo = index >= 0 && index < this.data.length && index !== this.data.index;

        if ( canGo ) {
            this.goto( index );
        }
    }


    updateUI () {
        this.currs.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
        this.items.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
        this._swapFunc();

        if (this.extraCurrs.length) {
            this.extraCurrs.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
        }
    }


    increment () {
        if ( this.data.index !== (this.data.length - 1) ) {
            this.data.index++;
        } else {
            this.data.index = 0;
        }
    }


    decrement () {
        if ( this.data.index !== 0 ) {
            this.data.index--;
        } else {
            this.data.index = this.data.length - 1;
        }
    }


    transition () {
        const offset = this.offsets[ this.elemData.spawn ];
        let movement = offset.move;

        if ( offset.coup && offset.coup.exec() ) {
            movement = offset.coup.move;

        } else if ( offset.moop && (window.innerWidth <= offset.moop.width) ) {
            movement = offset.moop.move;

        } else if ( offset.noop && (window.innerWidth <= offset.noop.width) ) {
            movement = offset.noop.move;
        }

        this.isMoving = true;
        this.calc = (typeof movement === "function" ? movement( this.data.index ) : `calc(${this.data.index} * ${movement})`);

        core.util.translate3d(
            this.belt[ 0 ],
            this.calc,
            "0",
            "0"
        );
    }


    goto ( idx ) {
        if ( this.inMotion() ) {
            return this;
        }

        this.data.index = idx;

        this.updateUI();
        this.transition();
        this.timeout();
    }


    advance () {
        if ( this.inMotion() ) {
            return this;
        }

        this.increment();
        this.updateUI();
        this.transition();
        this.timeout();
    }


    rewind () {
        if ( this.inMotion() ) {
            return this;
        }

        this.decrement();
        this.updateUI();
        this.transition();
        this.timeout();
    }


    timeout () {
        setTimeout( () => {
            this.isMoving = false;
            this.isPanning = false;

        }, 500 );
    }



    destroy () {
        if ( this.resizer ) {
            this.resizer.destroy();
        }

        if ( this.swiper ) {
            this.swiper.destroy();
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Slider;
