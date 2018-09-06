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
        this.element.on( "click", ".js-taxi-cat", ( e ) => {
            const targ = $( e.target );
            const cats = this.element.find( ".js-taxi-cat" );

            cats.removeClass( "is-active" );
            targ.addClass( "is-active" );

            this.getDocuments();
        });
    }


    getDocuments () {
        const cat = this.element.find( ".js-taxi-cat.is-active" );
        const data = cat.data();
        let apiUrl = `${this.data.url}?ajax=1`;
        let webUrl = `${this.data.page}`;

        if ( data.value ) {
            apiUrl += `&category=${data.value}`;
            webUrl += `?category=${data.value}`;
        }

        this.viewInstance.element.find( core.config.lazyAnimSelector ).removeClass( "is-animated" );

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
