const config = require( "../clutch.config" );
const router = require( "./core/router" );
const path = require( "path" );
const fs = require( "fs" );
const fetchFields = [
    "page.title",
    "page.image",
    "page.theme",
    "page.description",
    "page.industry_category",
    "story.canonical_url",
    "story.title",
    "story.image",
    "story.theme",
    "story.description",
    "story.excerpt",
    "story.industry_category",
    "author.name",
    "author.image",
    "author.description",
    "cta.hubspot_form",
    "cta.page_link",
    "cta.title",
    "cta.description",
    "cta.link_text",
    "cta.label",
    "cta.image"
];



router.on( "all", {
    fetchLinks ( client, api, form, cache, req ) {
        form.fetchLinks( fetchFields );
    }
});
router.on( "authorizations", {
    query ( client, api, query, cache, req ) {
        return new Promise(( resolve, reject ) => {
            resolve({
                results: config.authorizations.apps.map(( app ) => {
                    const authFile = path.join( __dirname, `../sandbox/authorizations/${app}.auth.json` );

                    return {
                        authorized: fs.existsSync( authFile ),
                        app
                    };
                })
            });
        });
    }
});
router.on( "story", {
    fetchLinks ( client, api, form, cache, req ) {
        form.fetchLinks( fetchFields );
    },
    query ( client, api, query, cache, req ) {
        if ( req.query.tag ) {
            query.push( client.Predicates.any( "document.tags", Array.isArray( req.query.tag ) ? req.query.tag : [req.query.tag] ) );
        }

        return query;
    },
    orderings ( client, api, form, cache, req ) {
        form.orderings( ["my.story.sort_date desc"] );
    },
    pagination ( client, api, form, cache, req ) {
        // Only handle paging for AJAX API requests...
        if ( req.query.ajax && !req.query.nopaging ) {
            form.pageSize( config.pagination.size );
            form.page( (req.query.page || 1) );
        }
    },
    filterResults ( client, api, json, cache, req ) {
        let docs = json.results;

        // Industry category?
        if ( !req.params.uid && !req.query.industry_category ) {
            docs = docs.filter(( doc ) => {
                if ( doc.data.industry_category ) {
                    return false;

                } else {
                    return true;
                }
            });

        } else if ( req.query.industry_category ) {
            docs = docs.filter(( doc ) => {
                if ( doc.data.industry_category && (doc.data.industry_category === req.query.industry_category) ) {
                    return true;

                } else {
                    return false;
                }
            });
        }

        // Must return json.results at least
        return docs;
    }
});



router.init();
