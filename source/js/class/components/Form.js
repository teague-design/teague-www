import $ from "properjs-hobo";
import router from "../../router";
import * as core from "../../core";



class Form {
    constructor ( element, data ) {
        this.element = element;
        this.fields = this.element.find( ".js-form-field" );
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
        if ( this.fields.length === 1 ) {
            this.element.on( "keypress", ( e ) => {
                if ( e.keyCode === 13 ) {
                    e.preventDefault();
                    this.processForm();
                    return false;
                }
            });
        }
    }


    processForm () {
        this.parseForm();
        this.postForm().then(( json ) => {
            this.clearForm();

            core.log( json );

        }).catch(( error ) => {
            core.log( "warn", error );
        });
    }


    parseForm () {
        this.formData = {
            _csrf: router.csrf,
            _data: {}
        };
        this.fields.forEach(( field ) => {
            this.formData._data[ field.name ] = {
                type: field.type,
                value: field.value
            };
        });
    }


    clearForm () {
        this.formData = {};
        this.fields.forEach(( field ) => {
            field.value = "";
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


    destroy () {
        this.element.off();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Form;
