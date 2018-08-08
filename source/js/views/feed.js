// import dom from "prismic-dom";
import viewImage from "./image";



export default ( view ) => {
    return `
        <div class="feed__grid">
            ${view.json.documents.map(( doc ) => {
                return `
                    <div class="feed__item">
                        ${viewImage( doc.data.image )}
                    </div>
                `;

            }).join( "" )}
        </div>
    `;
};
