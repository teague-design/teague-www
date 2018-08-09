import dom from "prismic-dom";
import viewImage from "./image";



export default ( view ) => {
    return `
        <div class="feed__grid">
            ${view.json.documents.map(( doc ) => {
                return `
                    <div class="feed__item">
                        <div class="feed__cat cms">
                            <h6>${doc.data.category}</h6>
                        </div>
                        <div class="feed__image">
                            ${viewImage( doc.data.image )}
                        </div>
                        <div class="feed__title cms">
                            ${dom.RichText.asHtml( doc.data.title ).replace( /h1/g, "h4" )}
                        </div>
                    </div>
                `;

            }).join( "" )}
        </div>
    `;
};
