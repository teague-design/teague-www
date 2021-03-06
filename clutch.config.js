const fs = require( "fs" );
const path = require( "path" );
const root = path.resolve( __dirname );
const read = ( file ) => {
    return String( fs.readFileSync( file ) ).replace( /^\s+|\s+$/g, "" );
};
const config = {
    // The URL of your actual site
    url: "http://teague.com",
    // Whitelist of URLs for valid CSRF
    // whitelist: [
    //     "http://localhost:8001",
    //     "http://54.71.20.59",
    //     "http://52.10.236.152",
    //     "http://teague.com",
    //     "http://www.teague.com",
    //     "http://staging.teague.com"
    // ],
    // Homepage UID
    homepage: "home",
    // Page Not Found UID — 404
    notfound: "404",
    // Page Server Error UID - 500
    notright: "500",
    // Pagination settings
    pagination: {
        size: 12, // Change to 12 !!!
        allSize: 100
    },
    // Timestamp ( Stamp of instantiation )
    timestamp: Date.now(),
    // Environments
    env: {
        sandbox: (process.env.NODE_ENV === "sandbox"),
        staging: (process.env.NODE_ENV === "staging"),
        production: (process.env.NODE_ENV === "production")
    },
    // API CMS config ( Prismic, Contentful )
    api: {
        // Prismic
        adapter: "prismic",
        access: "https://teague.cdn.prismic.io/api/v2", // This is your API URL
        token: true, // ./sandbox/prismic.access.token Set to true
        secret: "" // ./sandbox/prismic.webhook.secret
    },
    // Deployment config ( AWS )
    aws: {
        cdn: "",
        cdnOn: false // Turn on to use CDN ( You can just use S3 or add CloudFront if you want )
    },
    // Templating config
    template: {
        module: "ejs",
        dir: path.join( root, "template" ),
        layout: path.join( root, "template/index.html" ),
        pagesDir: path.join( root, "template", "pages" ),
        partialsDir: path.join( root, "template", "partials" ),
        staticDir: path.join( root, "static" )
    },
    // Express.js config
    express: {
        port: 8000
    },
    // Browser-sync config
    browser: {
        port: 8001,
        hobo: "is eq not one next prev attr last first index parent filter detach append remove trigger prepend closest children removeAttr toggleClass",
        appcache: false
    },
    // Static assets config
    static: {
        // One day
        maxAge: 86400000,
        endJS: `/js/app.${process.env.NODE_ENV}.js`,
        endCSS: `/css/screen.${process.env.NODE_ENV}.css`
    },
    // Compression js config
    compression: {
        level: 9,
        threshold: 0
    },
    // Generators config ( sitemap, robots, cache manifest )
    generate: {
        sitemap: {
            site: false,
            author: false,
            cta: false
        },
        robots: {
            site: false,
            page: false,
            author: false,
            cta: false
        },
        mappings: {
            // Useful for prismic collection forms
            // contentType => collectionId
            // e.g. casestudy: "work"
            // Ensures you get /work/:uid rather than /casestudy/:uid
            story: "stories",
            casestudy: "work"
        }
    },
    // Third-party app Oauth authorizations
    authorizations: {
        token: null,
        apps: [
            "icims",
            "vimeo",
            "hubspot"
        ]
    }
};



// Serves assets from either CDN ( production ) or App Server ( sandbox + staging )...
config.static.js = (config.aws.cdnOn && config.env.production) ? `${config.aws.cdn}${config.static.endJS}` : config.static.endJS;
config.static.css = (config.aws.cdnOn && config.env.production) ? `${config.aws.cdn}${config.static.endCSS}` : config.static.endCSS;



const prismicTokenPath = path.join( __dirname, "./sandbox/prismic.access.token" );
const prismicSecretPath = path.join( __dirname, "./sandbox/prismic.webhook.secret" );
const contentfulTokenPath = path.join( __dirname, "./sandbox/contentful.access.token" );
const contentfulPreviewPath = path.join( __dirname, "./sandbox/contentful.preview.token" );
const clutchAuthorizationsTokenPath = path.join( __dirname, "./sandbox/clutch.authorizations.token" );



// Configure access token for authorizations
if ( fs.existsSync( clutchAuthorizationsTokenPath ) ) {
    config.authorizations.token = read( clutchAuthorizationsTokenPath );
}



// Configure access tokens for APIs
if ( config.api.adapter === "prismic" && config.api.token !== false && fs.existsSync( prismicTokenPath ) ) {
    config.api.token = read( prismicTokenPath );

    if ( fs.existsSync( prismicSecretPath ) ) {
        config.api.secret = read( prismicSecretPath );
    }

// Contentful
} else if ( config.api.adapter === "contentful" && config.api.token !== false && fs.existsSync( contentfulTokenPath ) ) {
    config.api.token = read( contentfulTokenPath );
    config.api.preview = read( contentfulPreviewPath );
}



module.exports = config;
