// import dom from "prismic-dom";



export default ( view ) => {
    const isOne = ((view.json.formFieldGroups.length === 1) && (view.json.formFieldGroups[ 0 ].fields.length === 1));
    const typeMap = {
        email: "email"
    };

    return `
        ${view.json.formFieldGroups.map(( fieldGroup ) => {
            return `
                <div class="form__group">
                    ${fieldGroup.fields.map(( field ) => {
                        return `
                            <div class="form__block">
                                <div class="form__field">
                                    <input name="${field.name}" type="${typeMap[ field.name ] || field.fieldType}" placeholder="${field.label}" class="form__input js-form-field" />
                                    ${isOne ? `<button class="form__sub btn" type="submit">${view.json.submitText}</button>` : ``}
                                </div>
                            </div>
                        `;

                    }).join( "" )}
                </div>
            `;

        }).join( "" )}
        ${!isOne ? `
            <div class="form__group">
                <div class="form__block">
                    <div class="form__field form__button">
                        <button class="form__sub btn" type="submit">
                            <div class="btn__text">${view.json.submitText}</div>
                            <div class="btn__anim"></div>
                        </button>
                    </div>
                </div>
            </div>
        ` : ``}
    `;
};
