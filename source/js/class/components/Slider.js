import * as core from "../../core";
import $ from "properjs-hobo";


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
        this.prev = this.element.find( ".js-slider-prev" );
        this.next = this.element.find( ".js-slider-next" );
        this.currs = this.element.find( ".js-slider-curr" );
        this.items = this.element.find( ".js-slider-item" );
        this.data = {
            index: 0,
            length: this.currs.length
        };
        this.offsets = {
            home: {
                move: "(-50vw - 10vw)"
            },
            edge: {
                move: "-100vw"
            },
            paddy: {
                move: "(-70vw - 10vw)"
            },
            work: {
                move: "(-32vw - 10vw)",
                noop: {
                    move: "(-70vw - 10vw)",
                    width: 1024
                }
            }
        };
        this.isPanning = false;
        this._spawnFunc = this[ `spawn_${this.elemData.spawn}` ].bind( this );
        this._swapFunc = this[ `swap_${this.elemData.spawn}` ].bind( this );

        this.init();
        this.bind();
        this._spawnFunc();
    }


    spawn_edge () {}
    swap_edge () {}


    spawn_paddy () {}
    swap_paddy () {}


    spawn_work () {}
    swap_work () {}


    spawn_home () {
        this.splash = this.element.find( ".js-slider-splash" );
        this.splashItems = this.element.find( ".js-slider-splash-item" );

        this.splashItems.first().addClass( "is-active" );
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
    }


    bind () {
        this.prev.on( "click", () => {
            if ( this.data.index !== 0 ) {
                this.rewind();
            }
        });
        this.next.on( "click", () => {
            if ( this.data.index !== (this.data.length - 1) ) {
                this.advance();
            }
        });
        this.currs.on( "click", this.onHitItem.bind( this ));
        this.items.on( "click", this.onHitItem.bind( this ));
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
        this._swapFunc();
        this.currs.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
        this.items.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
    }


    increment () {
        if ( this.data.index !== (this.data.length - 1) ) {
            this.data.index++;
        }
    }


    decrement () {
        if ( this.data.index !== 0 ) {
            this.data.index--;
        }
    }


    transition () {
        const offset = this.offsets[ this.elemData.spawn ];
        let movement = offset.move;

        if ( offset.noop && (window.innerWidth <= offset.noop.width) ) {
            movement = offset.noop.move;
        }

        this.isPanning = true;
        this.calc = `calc(${this.data.index} * ${movement})`;

        core.util.translate3d(
            this.belt[ 0 ],
            this.calc,
            "0",
            "0"
        );
    }


    goto ( idx ) {
        if ( this.isPanning ) {
            return this;
        }

        this.data.index = idx;

        this.updateUI();
        this.transition();
        this.timeout();
    }


    advance () {
        if ( this.isPanning ) {
            return this;
        }

        this.increment();
        this.updateUI();
        this.transition();
        this.timeout();
    }


    rewind () {
        if ( this.isPanning ) {
            return this;
        }

        this.decrement();
        this.updateUI();
        this.transition();
        this.timeout();
    }


    timeout () {
        setTimeout( () => {
            this.isPanning = false;

        }, 500 );
    }



    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Slider;
