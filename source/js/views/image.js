// main: 2400, tablet: 1600, mobile: 800
export default ( image ) => {
    return `
        <div class="image-wrap">
            <img class="image js-lazy-image" data-img-src="${image.url}" data-img-json='${JSON.stringify( image )}' />
        </div>
    `;
};
