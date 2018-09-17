// import * as core from "../../core";
import $ from "properjs-hobo";
import ResizeController from "properjs-resizecontroller";


/**
 *
 * @public
 * @global
 * @class Triggers
 * @param {Element} element The dom element to work with.
 * @classdesc Handle toggling things...
 *
 */
class Triggers {
    constructor ( element ) {
        this.element = element;
        this.triggers = this.element.find( ".js-triggers-trigger" );
        this.contents = this.element.find( ".js-triggers-active" );
        this.resizer = new ResizeController();

        this.init();
        this.bind();
    }


    init () {
        this.triggers.first().addClass( "is-active" );
        this.contents.first().addClass( "is-active" );
    }


    bind () {
        const onResize = () => {
            const parent = this.contents.first().parent();
            let height = 0;

            if ( window.innerWidth <= 1024 ) {
                this.contents.forEach(( el ) => {
                    const bounds = el.getBoundingClientRect();

                    if ( bounds.height > height ) {
                        height = bounds.height;
                    }
                });

                parent[ 0 ].style.height = `${height}px`;

            } else {
                parent[ 0 ].style.height = "auto";
            }
        };

        this.resizer.on( "resize", onResize );
        onResize();

        this.element.on( "click", ".js-triggers-trigger", ( e ) => {
            const targ = $( e.target );
            const data = targ.data();
            const index = parseInt( data.index, 10 );

            this.contents.removeClass( "is-active" );
            this.contents.eq( index ).addClass( "is-active" );
            this.triggers.removeClass( "is-active" );
            this.triggers.eq( index ).addClass( "is-active" );
        });
    }


    destroy () {
        this.element.off();
        this.resizer.destroy();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Triggers;
