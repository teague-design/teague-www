import dom from "prismic-dom";



export default ( view ) => {
    // view.json.documents
    // documents will be filtered by `tag` and ordered by last_publication_date DESC
    const story = view.json.documents.shift();
    const title = dom.RichText.asHtml( story.data.title ).replace( /h1/g, "h3" );

    // console.log( story );

    return `
        <div class="cms">
            <div class="-exp">${title}</div>
            <div class="">
                <a class="link" href="/${story.type}/${story.uid}/">
                    <div class="link__wrap">
                        <div class="link__text">Read All About It</div>
                        <div class="link__icon icon icon--arrow">
                            <svg class="svg svg--arrow svg--spot">
                                <polygon points="24,0 24,5 27,2.5" />
                                <rect y="2" width="24" height="1" />
                            </svg>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    `;
};
