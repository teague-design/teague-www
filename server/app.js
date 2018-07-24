const config = require( "../clutch.config" );
const router = require( "./core/router" );
const path = require( "path" );
const fs = require( "fs" );



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
        form.fetchLinks([
            "page.title",
            "page.image",
            "page.description"
        ]);
    }
});



router.init();
