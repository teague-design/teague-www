import $ from "properjs-hobo";
import * as core from "../../core";



class FormOver {
    constructor ( element, data ) {
        this.element = element;
        this.elemData = data;
        this.navis = this.element.find( ".js-formover-navi" );
        this.panels = this.element.find( ".js-formover-panel" );
        this.ex = this.element.find( ".js-formover-ex" );

        this.bind();
    }


    bind () {
        this._onTriggerClick = this.onTriggerClick.bind( this );

        this.ex.on( "click", () => {
            this.close();
        });

        this.navis.on( "click", ( e ) => {
            const navi = $( e.target );
            const data = navi.data();
            const targs = this.element.find( `.${data.json.target}` );

            this.navis.removeClass( "is-active" );
            this.panels.removeClass( "is-active" );
            targs.addClass( "is-active" );
        });

        core.dom.body.on( "click", ".js-formover-trigger", this._onTriggerClick );
    }


    onTriggerClick ( e ) {
        const elem = $( e.target );
        const trig = elem.is( ".js-formover-trigger" ) ? elem : elem.closest( ".js-formover-trigger" );
        const data = trig.data();
        const targs = this.element.find( `.${data.json.target}` );

        this.navis.removeClass( "is-active" );
        this.panels.removeClass( "is-active" );
        targs.addClass( "is-active" );

        this.open();
    }


    open () {
        core.dom.html.addClass( "is-formover-open" );
        this.element.addClass( "is-active" );
    }


    close () {
        core.dom.html.removeClass( "is-formover-open" );
        this.element.removeClass( "is-active" );
        this.navis.removeClass( "is-active" );
        this.panels.removeClass( "is-active" );
    }

    destroy () {
        core.dom.body.off( "click", this._onTriggerClick );
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default FormOver;
