import $ from "properjs-hobo";
import router from "../../router";
import * as core from "../../core";



class Form {
    constructor ( element, data ) {
        this.element = element;
        this.fields = null;
        this.view = null;
        this.elemData = data;
        this.formData = {};
        this.action = this.elemData.action.toLowerCase();

        this.bind();
        this.bindDropdown();
    }


    bind () {
        this.element.on( "submit", ( e ) => {
            e.preventDefault();
            this.processForm();
            return false;
        });

        // Only trap Enter on single input forms, like Newsletter
        this.element.on( "keypress", ( e ) => {
            this.getFields();

            if ( this.fields.length === 1 && e.keyCode === 13 ) {
                e.preventDefault();
                this.processForm();
                return false;
            }
        });
    }


    bindDropdown () {
        this.element.on( "click", ".js-form-show", ( e ) => {
            const targ = $( e.target );
            const elem = targ.closest( ".js-form-select" );
            const menu = elem.find( ".js-form-menu" );

            menu.toggleClass( "is-active" );
        });

        this.element.on( "click", ".js-form-option", ( e ) => {
            const targ = $( e.target );
            const elem = targ.closest( ".js-form-select" );
            const menu = elem.find( ".js-form-menu" );
            const opts = elem.find( ".js-form-option" );
            const show = elem.find( ".js-form-show" );

            // Toggle menu options
            opts.removeClass( "is-active" );
            targ.addClass( "is-active" );
            menu.removeClass( "is-active" );

            // Update show label
            show[ 0 ].innerHTML = targ.is( ".is-active" ) ? targ.data().value : show.data().default;
        });
    }


    processForm () {
        this.getFields();
        this.parseForm();
        this.postForm().then(( json ) => {
            if ( json.error ) {
                core.log( "warn", json.error );

            } else {
                this.clearForm();
                core.log( json );
            }
        });
    }


    getFields () {
        this.fields = this.element.find( ".js-form-field" );
    }


    parseForm () {
        this.formData = {
            _csrf: router.csrf,
            _page: {
                url: window.location.href,
                title: document.title
            },
            _action: this.action,
            _form: {}
        };
        this.fields.forEach(( el, i ) => {
            const field = this.fields.eq( i );

            if ( field.is( ".js-form-select" ) ) {
                const active = field.find( ".js-form-option.is-active" );
                const data = field.data();

                this.formData._form[ data.name ] = {
                    name: data.name,
                    type: "select",
                    value: active.length ? active.data().value : ""
                };

            } else {
                this.formData._form[ el.name ] = {
                    name: el.name,
                    type: el.type,
                    value: el.value
                };
            }
        });
    }


    postForm () {
        return $.ajax({
            url: `/api/hubspot/form-${this.action}`,
            dataType: "json",
            method: "POST",
            data: this.formData,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }


    clearForm () {
        this.formData = {};
        this.fields.forEach(( el, i ) => {
            const field = this.fields.eq( i );

            if ( field.is( ".js-form-select" ) ) {
                const show = field.find( ".js-form-show" );

                field.find( ".js-form-menu" ).removeClass( "is-active" );
                field.find( ".js-form-option" ).removeClass( "is-active" );

                show[ 0 ].innerHTML = show.data().default;

            } else {
                el.value = "";
            }
        });
    }


    destroy () {
        this.element.off();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Form;
