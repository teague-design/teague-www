const config = require( "../clutch.config" );
const router = require( "./core/router" );
const path = require( "path" );
const fs = require( "fs" );
const fetchFields = [
    "page.title",
    "page.image",
    "page.description"
];



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
router.on( "page", {
    fetchLinks ( client, api, form, cache, req ) {
        form.fetchLinks( fetchFields );
    }
});
router.on( "site", {
    fetchLinks ( client, api, form, cache, req ) {
        form.fetchLinks( fetchFields );
    }
});
router.on( "latest", {
    query ( client, api, query, cache, req ) {
        if ( req.query.tag ) {
            query.push( client.Predicates.at( "document.tags", [req.query.tag] ) );
        }

        return query;
    },
    orderings ( client, api, form, cache, req ) {
        form.orderings( ["document.last_publication_date desc"] );
    }
});



router.init();
