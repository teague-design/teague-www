// https://developer.icims.com/REST-API/Object-Types-Commands/Job-Portal-API



const path = require( "path" );
const fs = require( "fs" );
const request = require( "request-promise" );
const lager = require( "properjs-lager" );
const parser = require( "node-html-parser" );
const core = {
    files: require( "../core/files" ),
    config: require( "../../clutch.config" )
};
const authorization = {
    config: require( "../../sandbox/authorizations/icims.config" ),
    store: path.join( __dirname, "../../sandbox/authorizations/icims.auth.json" )
};
const jobFields = [
    "jobid",
    "jobtitle",
    "joblocation",
    "overview"
];



const getICIMSBuff = () => {
    return Buffer.from( `${authorization.config.clientId}:${authorization.config.clientSecret}` ).toString( "base64" );
};
const getICIMSAPIData = ( req, res, url ) => {
    return new Promise(( resolve, reject ) => {
        request({
            url,
            json: true,
            method: "GET",
            headers: {
                "Host": "api.icims.com",
                "Authorization": `Basic ${getICIMSBuff()}`,
                "Cache-Control": "no-cache"
            }

        }).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            reject( error );
        });
    });
};
const getICIMSSchema = ( req, res ) => {
    const url = `https://api.icims.com/customers/${authorization.config.customerId}/profiledefinitions/v1/${req.params.profile}/schema`;

    getICIMSAPIData( req, res, url ).then(( json ) => {
        res.status( 200 ).json( json );

    }).catch(( error ) => {
        res.status( 200 ).json( error );
    });
};
const getICIMSJobs = ( req, res ) => {
    const url = `https://api.icims.com/customers/${authorization.config.customerId}/search/portals/${authorization.config.portalId}`;

    return getICIMSAPIData( req, res, url );
};
const getICIMSJob = ( req, res, jobId ) => {
    const url = `https://api.icims.com/customers/${authorization.config.customerId}/jobs/${jobId}?fields=${jobFields.join( "," )}`;

    return getICIMSAPIData( req, res, url );
};
const getICIMSCompany = ( req, res, companyId ) => {
    const url = `https://api.icims.com/customers/${authorization.config.customerId}/companies/${companyId}`;

    return getICIMSAPIData( req, res, url );
};
const getICIMSCareers = ( req, res ) => {
    return new Promise(( resolve, reject ) => {
        getICIMSJobs( req, res ).then(( json ) => {
            const total = json.searchResults.length;
            const jobs = [];

            json.searchResults.forEach(( result ) => {
                getICIMSJob( req, res, result.id ).then(( job ) => {
                    const root = parser.parse( job.overview );
                    const sendJob = {
                        title: job.jobtitle,
                        excerpt: root.firstChild.rawText.substring( 0, 300 ),
                        portalUrl: result.portalUrl,
                        city: null,
                        state: null
                    };

                    getICIMSCompany( req, res, job.joblocation.companyid ).then(( company ) => {
                        sendJob.city = company.addresses[ 0 ].addresscity;
                        sendJob.state = company.addresses[ 0 ].addressstate.abbrev;

                        jobs.push( sendJob );

                        if ( jobs.length === total ) {
                            res.status( 200 ).json({
                                jobs
                            });
                        }
                    });
                });
            });
        });
    });
};



module.exports = {
    init ( expressApp ) {
        expressApp.get( "/api/icims/schema/:profile", getICIMSSchema );
        expressApp.get( "/api/icims/jobs/", getICIMSCareers );
    },


    auth ( req, res ) {
        res.status( 200 ).json({
            authorized: fs.existsSync( authorization.store )
        });
    }
};
