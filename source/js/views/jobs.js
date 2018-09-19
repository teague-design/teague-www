import $ from "properjs-hobo";



export default ( view ) => {
    // console.log( view );
    return `
        <div class="jobs__label">
            <h6>Open Positions (&nbsp;${view.json.jobs.length}&nbsp;)</h6>
        </div>
        ${view.json.jobs.map(( job ) => {
            return `<div class="jobs__job">
                <div class="jobs__l">
                    <div class="jobs__title">
                        <h4>${job.title}</h4>
                    </div>
                    <div class="jobs__location">
                        <p>${job.city}, ${job.state}</p>
                    </div>
                </div>
                <div class="jobs__r">
                    <div class="jobs__desc">
                        <p>${job.excerpt}&hellip;</p>
                    </div>
                    <div class="jobs__link">
                        <a class="link" href="${job.portalUrl}" target="_blank">
                            <div class="link__wrap">
                                <div class="link__text">Read More</div>
                                <div class="link__icon icon icon--arrow">
                                    <svg class="svg svg--arrow svg--spot">
                                        <polygon points="24,0 24,5 27,2.5" />
                                        <rect y="2" width="35" height="1" />
                                    </svg>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>`;

        }).join( "" )}
    `;
};
