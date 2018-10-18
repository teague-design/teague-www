import dom from "prismic-dom";
import viewImage from "./image";
import $ from "properjs-hobo";
import paramalama from "paramalama";
import smartypants from "smartypants";



export default ( view ) => {
    const typeMap = {
        story: "stories",
        casestudy: "work"
    };
    const getType = ( doc ) => {
        return (typeMap[ doc.type ] || doc.type);
    };
    const getPagedQuery = ( page ) => {
        const query = paramalama( window.location.search );

        query.page = page;

        return `?${decodeURIComponent( $.utils.serializeData( query ) )}`;
    };
    const getStringJSON = ( json ) => {
        json.title = smartypants( json.title );

        return JSON.stringify( json );
    };

    return `
        <div class="feed__grid">
            ${view.json.documents.map(( doc ) => {
                const json = {
                    title: dom.RichText.asText( doc.data.title ),
                    story: true,
                    tag: doc.tags[ 0 ]
                };

                return `
                    <div class="feed__item js-lazy-anim">
                        <div class="feed__image">
                            <a href="/${getType( doc )}/${doc.uid}/" data-json='${getStringJSON( json )}'>
                                ${viewImage( doc.data.image )}
                            </a>
                        </div>
                        <div class="feed__tag cms">
                            <a href="/${getType( doc )}/${doc.uid}/" data-json='${getStringJSON( json )}'>
                                <h6>${doc.tags[ 0 ]}</h6>
                            </a>
                        </div>
                        <div class="feed__title cms">
                            <a class="h5" href="/${getType( doc )}/${doc.uid}/" data-json='${getStringJSON( json )}'>
                                ${dom.RichText.asText( doc.data.title )}
                            </a>
                        </div>
                    </div>
                `;

            }).join( "" )}
        </div>
        <div class="feed__pagination">
            ${view.json.pagination.prev_page ? `<a class="feed__pagination__prev" href="${view.data.page}${getPagedQuery( view.json.pagination.page - 1 )}"><span class="h6 -spot">Prev</span></a>` : ``}
            <div class="feed__pagination__curr p">${view.json.pagination.page} of ${view.json.pagination.total_pages}</div>
            ${view.json.pagination.next_page ? `<a class="feed__pagination__next" href="${view.data.page}${getPagedQuery( view.json.pagination.page + 1 )}"><span class="h6 -spot">Next</span></a>` : ``}
        </div>
    `;
};
