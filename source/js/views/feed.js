// import dom from "prismic-dom";



export default ( view ) => {
    return `
        <div class="feed__grid">
            ${view.json.documents.map(( doc ) => {
                // 2400, 1600, 800
                // Feed does not require full 2400 wide image so 1600 tablet works well here
                const imgSrc = doc.data.image.tablet ? doc.data.image.tablet.url : doc.data.image.url;
                const mobSrc = doc.data.image.mobile ? doc.data.image.mobile.url : null;

                return `
                    <div class="feed__item">
                        <img class="image js-lazy-image" data-img-src="${imgSrc}" ${mobSrc ? `data-mobile="${mobSrc}"` : ""} />
                    </div>
                `;

            }).join( "" )}
        </div>
    `;
};
