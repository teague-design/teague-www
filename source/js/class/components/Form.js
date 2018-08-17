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

        this.bind();
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
            _form: {}
        };
        this.fields.forEach(( field ) => {
            this.formData._form[ field.name ] = {
                type: field.type,
                value: field.value
            };
        });
    }


    postForm () {
        return $.ajax({
            url: `/api/hubspot/form-${this.elemData.action.toLowerCase()}`,
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
        this.fields.forEach(( field ) => {
            field.value = "";
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
