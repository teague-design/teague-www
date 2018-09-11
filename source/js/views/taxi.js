// import dom from "prismic-dom";
import paramalama from "paramalama";



export default ( view ) => {
    const params = paramalama( window.location.search );
    const tags = [];

    view.json.documents.forEach(( doc ) => {
        doc.tags.forEach(( tag ) => {
            if ( tags.indexOf( tag ) === -1 ) {
                tags.push( tag );
            }
        });
    });

    return `
        <div class="taxi__tags">
            <div class="taxi__label p">Filter by</div>
            <a class="taxi__tag js-taxi-tag h6 ac ${params.tag ? "" : "is-active"}" href="${view.data.page}">All</a>
            ${tags.map(( tag ) => {
                return `<a class="taxi__tag js-taxi-tag h6 ac ${params.tag === tag ? "is-active" : ""}" href="#${view.data.page}?tag=${tag}" data-value="${tag}">${tag}</a>`;

            }).join( "" )}
        </div>
    `;
};
