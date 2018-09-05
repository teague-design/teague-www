import dom from "prismic-dom";
import paramalama from "paramalama";



export default ( view ) => {
    const params = paramalama( window.location.search );
    const cats = [];

    view.json.documents.forEach(( doc ) => {
        if ( cats.indexOf( doc.data.category ) === -1 ) {
            cats.push( doc.data.category );
        }
    });

    return `
        <div class="taxi__cats">
            <div class="taxi__label p">Filter by</div>
            <a class="taxi__cat js-taxi-cat h6 ${params.category ? "" : "is-active"}" href="${view.data.page}">All</a>
            ${cats.map(( cat ) => {
                return `<a class="taxi__cat js-taxi-cat h6 ${params.category === cat ? "is-active" : ""}" href="#${view.data.page}?category=${cat}" data-value="${cat}">${cat}</a>`;

            }).join( "" )}
        </div>
    `;
};
