import * as core from "../core";
import $ from "properjs-hobo";


/**
 *
 * @public
 * @namespace navi
 * @description Performs the branded load-in screen sequence.
 * @memberof menus
 *
 */
const navi = {
    /**
     *
     * @public
     * @method init
     * @memberof menus.navi
     * @description Method initializes navi node in DOM.
     *
     */
    init () {
        this.isOpen = false;
        this.element = core.dom.body.find( ".js-navi" );
        this.header = core.dom.body.find( ".js-header" );
        this.items = this.element.find( ".js-navi-a" );
        this.mobile = core.dom.body.find( ".js-navi-mobile" );
        this.mobileTrigger = core.dom.body.find( ".js-menu-icon-navi" );
        this.mobileItems = this.mobile.find( ".js-navi-a" );
        this.bind();
    },


    bind () {
        this.mobileTrigger.on( "click", () => {
            this.toggle();
        });

        this.mobileItems.on( "click", ".js-navi-a", ( e ) => {
            const targ = $( e.target );
            const data = targ.data();

            console.log( data );
        });
    },


    open () {
        this.isOpen = true;
        this.mobile.addClass( "is-active" );
        core.dom.html.addClass( "is-navi-mobile-open" );
    },


    close () {
        this.isOpen = false;
        this.mobile.removeClass( "is-active" );
        core.dom.html.removeClass( "is-navi-mobile-open" );
    },


    active ( view ) {
        this.items.removeClass( "is-active" );
        this.items.filter( `.js-navi--${view}` ).addClass( "is-active" );
        this.mobileItems.removeClass( "is-active" );
        this.mobileItems.filter( `.js-navi--${view}` ).addClass( "is-active" );
    },


    toggle () {
        if ( this.isOpen ) {
            this.close();

        } else {
            this.open();
        }
    }
};


/******************************************************************************
 * Export
*******************************************************************************/
export default navi;
