import $ from "properjs-hobo";
import router from "../../router";



class Form {
    constructor ( element, data ) {
        this.element = element;
        this.data = data;

        this.bind();
    }


    bind () {
        this.element.on( "submit", ( e ) => {
            e.preventDefault();

            this.postForm();

            return false;
        });
    }


    postForm () {
        $.ajax({
            url: `/api/hubspot/form-${this.data.action.toLowerCase()}`,
            dataType: "json",
            method: "POST",
            data: {
                _csrf: router.csrf
            },
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }

        }).then(( json ) => {
            console.log( json );

        }).catch(( error ) => {
            console.log( error );
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
