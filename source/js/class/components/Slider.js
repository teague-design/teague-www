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
        this.belt = this.element.find( ".js-slider-belt" );
        this.prev = this.element.find( ".js-slider-prev" );
        this.next = this.element.find( ".js-slider-next" );
        this.currs = this.element.find( ".js-slider-curr" );
        this.data = {
            index: 0,
            length: this.currs.length
        };
        this.isPanning = false;

        this.init();
        this.bind();
    }


    init () {
        this.currs.first().addClass( "is-active" );
    }


    bind () {
        this.prev.on( "click", () => {
            this.rewind();
        });
        this.next.on( "click", () => {
            this.advance();
        });
        this.currs.on( "click", ( e ) => {
            const target = $( e.target );
            const index = parseInt( target.data().index, 10 );

            this.goto( index );
        });
    }


    updateUI () {
        this.currs.removeClass( "is-active" ).eq( this.data.index ).addClass( "is-active" );
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
        this.isPanning = true;
        this.calc = `calc(${this.data.index} * (-50vw - 10vw))`;

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
