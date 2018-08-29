import $ from "properjs-hobo";
import * as core from "../../core";
import router from "../../router";



class Taxi {
    constructor ( element, data ) {
        this.element = element;
        this.data = data;
        this.viewElement = core.dom.body.find( `.js-view[data-uid="${this.data.view}"]` );
        this.viewInstance = this.viewElement.data().View;

        this.bind();
    }


    bind () {
        this.element.on( "click", ".js-taxi-show", ( e ) => {
            const targ = $( e.target );
            const elem = targ.closest( ".js-taxi-select" );
            const menu = elem.find( ".js-taxi-menu" );

            this.element.find( ".js-taxi-menu" ).not( menu ).removeClass( "is-active" );

            menu.toggleClass( "is-active" );
        });

        this.element.on( "click", ".js-taxi-option", ( e ) => {
            const targ = $( e.target );
            const elem = targ.closest( ".js-taxi-select" );
            const opts = elem.find( ".js-taxi-option" );
            const show = elem.find( ".js-taxi-show" );
            const data = elem.data();

            // Toggle menu options
            if ( targ.is( ".is-active" ) ) {
                targ.removeClass( "is-active" );

            } else if ( data.style === "single" ) {
                opts.removeClass( "is-active" );
                targ.addClass( "is-active" );

            } else {
                targ.addClass( "is-active" );
            }

            // Update show label
            if ( data.style === "single" ) {
                show[ 0 ].innerHTML = targ.is( ".is-active" ) ? targ.data().value : show.data().default;

            } else {
                show[ 0 ].innerHTML = `${show.data().default} (${opts.filter( ".is-active" ).length})`;
            }
        });

        this.element.on( "click", ".js-taxi-sub", () => {
            this.element.find( ".js-taxi-menu" ).removeClass( "is-active" );

            this.getDocuments();
        });
    }


    getDocuments () {
        const opts = this.element.find( ".js-taxi-option.is-active" );
        const query = opts.map(( opt ) => {
            const $opt = $( opt );
            const data = $opt.data();

            return `${data.query}=${data.value}`;

        }).join( "&" );
        const apiUrl = `${this.data.url}?${query}`;
        const webUrl = `${this.data.page}?${query}`;

        $.ajax({
            url: apiUrl,
            dataType: "json",
            method: "GET"

        }).then(( json ) => {
            this.viewInstance.update( json );
        });

        router.push( webUrl );
    }


    destroy () {}
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Taxi;
