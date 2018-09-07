const config = require( "../clutch.config" );
const router = require( "./core/router" );
const path = require( "path" );
const fs = require( "fs" );
const fetchFields = [
    "page.title",
    "page.image",
    "page.theme",
    "page.description",
    "story.title",
    "story.image",
    "story.theme",
    "story.description",
    "story.excerpt",
    "story.category",
    "taxonomy.name",
    "taxonomy.image",
    "taxonomy.description",
    "taxonomy.type",
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



// Normalized fetch endpoints
[
    config.homepage,
    "site",
    "page",
    "work",
    "about",
    "careers",
    "stories",
    "contact",
    "privacy",
    "terms",
    "taxonomy"

].forEach(( type ) => {
    router.on( type, {
        fetchLinks ( client, api, form, cache, req ) {
            form.fetchLinks( fetchFields );
        }
    });
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
        // if ( req.query.tag ) {
        //     query.push( client.Predicates.any( "document.tags", Array.isArray( req.query.tag ) ? req.query.tag : [req.query.tag] ) );
        // }

        if ( req.query.category ) {
            query.push( client.Predicates.at( "my.story.category", req.query.category ) );
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
    }
});



router.init();
