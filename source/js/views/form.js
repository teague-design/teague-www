// import dom from "prismic-dom";



export default ( view ) => {
    const buildText = ( field ) => {
        return `<input name="${field.name}" type="${typeMap[ field.name ] || field.fieldType}" placeholder="${field.label}" class="form__input js-form-field" />`;
    };
    const buildArea = ( field ) => {
        return `<textarea name="${field.name}" placeholder="${field.label}" class="form__input form__area js-form-field"></textarea>`;
    };
    const buildSelect = ( field ) => {
        return `
            <div class="form__select js-form-select js-form-field" data-name="${field.name}">
                <div class="form__show js-form-show" data-default="${field.label}">${field.label}</div>
                <div class="form__menu js-form-menu">
                    ${field.options.map(( opt ) => {
                        return `<div class="form__option js-form-option" data-value="${opt.value}">${opt.label}</div>`;

                    }).join( "" )}
                </div>
            </div>
        `;
    };
    const isOne = ((view.json.formFieldGroups.length === 1) && (view.json.formFieldGroups[ 0 ].fields.length === 1));
    const typeMap = {
        email: "email"
    };
    const buildMap = {
        text: buildText,
        textarea: buildArea,
        select: buildSelect
    };

    return `
        ${view.json.formFieldGroups.map(( fieldGroup ) => {
            return `
                <div class="form__group">
                    ${fieldGroup.fields.map(( field ) => {
                        const build = buildMap[ field.fieldType ];

                        return (typeof build === "function") ? `
                            <div class="form__block">
                                <div class="form__field">
                                    ${build( field )}
                                    ${isOne ? `<button class="form__sub btn" type="submit">${view.json.submitText}</button>` : ``}
                                </div>
                            </div>
                        ` : ``;

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
