import dom from "prismic-dom";
import paramalama from "paramalama";



export default ( view ) => {
    const params = paramalama( window.location.search );
    const tags = [];
    const cats = [];

    if ( typeof params.tag === "string" ) {
        params.tag = [ params.tag ];
    }

    view.json.documents.forEach(( doc ) => {
        doc.tags.forEach(( tag ) => {
            if ( tags.indexOf( tag ) === -1 ) {
                tags.push( tag );
            }
        });

        if ( cats.indexOf( doc.data.category ) === -1 ) {
            cats.push( doc.data.category );
        }
    });

    return `
        <div class="taxi__fields">
            <div class="taxi__cats">
                <div class="taxi__select js-taxi-select" data-style="single">
                    <div class="taxi__show js-taxi-show" data-default="Category">${params.category || "Category"}</div>
                    <div class="taxi__menu js-taxi-menu">
                        ${cats.map(( cat ) => {
                            return `<div class="taxi__option js-taxi-option ${(params.category === cat) ? "is-active" : ""}" data-value="${cat}" data-query="category">${cat}</div>`;

                        }).join( "" )}
                    </div>
                </div>
            </div>
            <div class="taxi__tags">
                <div class="taxi__select js-taxi-select" data-style="multiple">
                    <div class="taxi__show js-taxi-show" data-default="Industry">Industry ${params.tag ? `(${params.tag.length})` : "(0)"}</div>
                    <div class="taxi__menu js-taxi-menu">
                        ${tags.map(( tag ) => {
                            return `<div class="taxi__option js-taxi-option ${(params.tag && params.tag.indexOf( tag ) !== -1) ? "is-active" : ""}" data-value="${tag}" data-query="tag[]">${tag}</div>`;

                        }).join( "" )}
                    </div>
                </div>
            </div>
            <button class="taxi__sub js-taxi-sub form__sub btn">Submit</button>
        </div>
    `;
};
