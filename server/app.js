const config = require( "../clutch.config" );
const router = require( "./core/router" );
const query = require( "./core/query" );
const path = require( "path" );
const fs = require( "fs" );
const fetchFields = require( "./fetchFields" );
const pubMethods = {
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
    }
};



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
router.on( "story", pubMethods );
router.on( "casestudy", pubMethods );



router.init();
