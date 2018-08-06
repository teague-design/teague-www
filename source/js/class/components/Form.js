class Form {
    constructor ( element, data ) {
        this.element = element;
        this.data = data;

        this.bind();
    }


    bind () {
        this.element.on( "submit", ( e ) => {
            e.preventDefault();
            console.log( this, e );
            return false;
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
