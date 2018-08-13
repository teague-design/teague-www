import dom from "prismic-dom";
import viewImage from "./image";



export default ( view ) => {
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
    `;
};
