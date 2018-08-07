const path = require( "path" );
const fs = require( "fs" );
const request = require( "request-promise" );
const core = {
    files: require( "../core/files" ),
    config: require( "../../clutch.config" )
};
const authorization = {
    config: require( "../../sandbox/authorizations/hubspot.config" ),
    store: path.join( __dirname, "../../sandbox/authorizations/hubspot.auth.json" )
};
const lager = require( "properjs-lager" );



const getHubspotAuth = ( req, res ) => {
    // 0.1 Authorization
    if ( !req.query.code ) {
        // https://developers.hubspot.com/docs/methods/oauth2/initiate-oauth-integration
        res.redirect( `https://app.hubspot.com/oauth/authorize?client_id=${authorization.config.clientId}&redirect_uri=${encodeURIComponent( authorization.config.redirectUrl )}&scope=${authorization.config.scope}` );

    // 0.2 Token Request
    } else if ( req.query.code ) {
        getHubspotToken( req, res, "authorization_code", () => {
            res.redirect( `/authorizations/?token=${core.config.authorizations.token}` );
        });
    }
};



const getHubspotToken = ( req, res, grantType, cb ) => {
    const form = {
        grant_type: grantType,
        redirect_uri: authorization.config.redirectUrl,
        client_secret: authorization.config.clientSecret,
        client_id: authorization.config.clientId
    };

    // Handle token refresh on expiration
    if ( grantType === "refresh_token" ) {
        const oauthJson = core.files.read( authorization.store, true );

        form.refresh_token = oauthJson.refresh_token;

    // Handle initial authorization redirect from Oauth2 window
    } else {
        form.code = req.query.code;
    }

    request({
        form,
        url: "https://api.hubapi.com/oauth/v1/token",
        json: true,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
        }

    }).then(( json ) => {
        json.created_at = Date.now();
        core.files.write( authorization.store, json, true );

        if ( typeof cb === "function" ) {
            cb();
        }
    });
}



const getHubspotAPIData = ( req, res, url ) => {
    const _getReq = () => {
        const oauthJson = core.files.read( authorization.store, true );

        request({
            url: url,
            json: true,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${oauthJson.access_token}`
            }

        }).then(( json ) => {
            res.status( 200 ).json( json );

        }).catch(( error ) => {
            getHubspotToken( req, res, "refresh_token", () => {
                _getReq();
            });
        });
    };

    _getReq();
};



const getHubspotForms = ( req, res ) => {
    getHubspotAPIData(
        req,
        res,
        "https://api.hubapi.com/forms/v2/forms"
    );
};



const getHubspotAnalytics = ( req, res ) => {
    getHubspotAPIData(
        req,
        res,
        "https://api.hubapi.com/analytics/v2/reports/totals/total"
    );
};



const postHubspotContactForm = ( req, res ) => {
    res.status( 200 ).json({
        form: "Contact"
    });
};



const postHubspotNewsletterForm = ( req, res ) => {
    res.status( 200 ).json({
        form: "Newsletter"
    });
};



module.exports = {
    init ( expressApp, checkCSRF ) {
        expressApp.get( "/api/hubspot/forms", getHubspotForms );
        expressApp.get( "/api/hubspot/analytics", getHubspotAnalytics );
        expressApp.post( "/api/hubspot/form-contact", checkCSRF, postHubspotContactForm );
        expressApp.post( "/api/hubspot/form-newsletter", checkCSRF, postHubspotNewsletterForm );
    },


    auth ( req, res ) {
        getHubspotAuth( req, res );
    }
};
