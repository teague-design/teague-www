"use strict";



const config = require( "../../clutch.config" );
const prismicDOM = require( "prismic-dom" );



/**
 *
 * Template Context {object}.
 *
 */
class ContextObject {
    constructor ( page ) {
        this.site = null;
        this.navi = null;
        this.footer = null;
        this.page = page;
        this.cache = config.env.production;
        this.error = null;
        this.timestamp = config.timestamp;
        this.item = null;
        this.items = null;
        this.stylesheet = config.static.css;
        this.javascript = config.static.js;
        this.config = config;
        this.dom = (config.api.adapter === "prismic" ? prismicDOM : null);
        this.env = process.env.NODE_ENV;
    }

    set ( prop, value ) {
        if ( typeof prop === "object" ) {
            for ( let i in prop ) {
                this[ i ] = prop[ i ];
            }

        } else {
            this[ prop ] = value;
        }
    }

    get ( prop ) {
        return this[ prop ];
    }

    getTemplate () {
        return `pages/${this.page}.html`;
    }

    getPageTitle () {
        const site = this.get( "site" );
        const item = this.get( "item" );
        let title = null;


        if ( item ) {
            title = `${prismicDOM.RichText.asText( item.data.title )} — ${prismicDOM.RichText.asText( site.data.title )}`;

        } else {
            title = prismicDOM.RichText.asText( site.data.title );
        }

        return title;
    }

    getPageImage () {
        const item = this.get( "item" );
        const appImage = this.get( "site" ).data.appImage.url;
        const pageImage = (item && item.data.image) ? item.data.image.url : null;

        return (pageImage || appImage);
    }

    getUrl ( doc ) {
        const type = (config.generate.mappings[ doc.type ] || doc.type);
        const resolvedUrl = doc.uid === config.homepage ? "/" : ((type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`);

        return resolvedUrl;
    }
    getUrlCanonical ( doc ) {
        const type = (config.generate.mappings[ doc.type ] || doc.type);
        const resolvedUrl = doc.uid === config.homepage ? "/" : ((type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`);
        const canonicalUrl = doc.data.canonical_url ? doc.data.canonical_url : `${config.url}${resolvedUrl}`;

        return canonicalUrl;
    }

    getMediaAspect ( media ) {
        return `${media.height / media.width * 100}%`;
    }
}



module.exports = ContextObject;
