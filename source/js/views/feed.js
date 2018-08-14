import dom from "prismic-dom";
import viewImage from "./image";
import $ from "properjs-hobo";
import paramalama from "paramalama";



export default ( view ) => {
    const getPagedQuery = ( page ) => {
        const query = paramalama( window.location.search );

        query.page = page;

        return `?${decodeURIComponent( $.utils.serializeData( query ) )}`;
    };

    return `
        <div class="feed__grid">
            ${view.json.documents.map(( doc ) => {
                return `
                    <div class="feed__item">
                        <div class="feed__cat cms">
                            <a href="${view.data.page}?category=${doc.data.category}">
                                <h6>${doc.data.category}</h6>
                            </a>
                        </div>
                        <div class="feed__image">
                            <a href="/${doc.type}/${doc.uid}/">
                                ${viewImage( doc.data.image )}
                            </a>
                        </div>
                        <div class="feed__title cms">
                            <a href="/${doc.type}/${doc.uid}/">
                                ${dom.RichText.asHtml( doc.data.title ).replace( /h1/g, "h4" )}
                            </a>
                        </div>
                    </div>
                `;

            }).join( "" )}
        </div>
        <div class="feed__pagination">
            ${view.json.pagination.prev_page ? `<a class="feed__pagination__next" href="${view.data.page}${getPagedQuery( view.json.pagination.page - 1 )}"><span class="h6 -spot">Next</span></a>` : ``}
            <div class="feed__pagination__curr p">${view.json.pagination.page} of ${view.json.pagination.total_pages}</div>
            ${view.json.pagination.next_page ? `<a class="feed__pagination__prev" href="${view.data.page}${getPagedQuery( view.json.pagination.page + 1 )}"><span class="h6 -spot">Prev</span></a>` : ``}
        </div>
    `;
};
