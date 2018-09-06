const request = require( "request-promise" );
const authorization = {
    config: require( "../../sandbox/authorizations/icims.config" )
};



const getICIMSBuff = () => {
    return Buffer.from( `${authorization.config.clientId}:${authorization.config.clientSecret}` ).toString( "base64" );
};
const getICIMSJobs = ( req, res ) => {
    // single job:
    // https://api.icims.com/customers/{custId}/portalposts/job/{jobId}
    request({
        url: `https://api.icims.com/customers/${authorization.config.customerId}`,
        json: true,
        method: "GET",
        headers: {
            "Host": "api.icims.com",
            "Authorization": `Basic ${getICIMSBuff()}`,
            "Cache-Control": "no-cache"
        }

    }).then(( json ) => {
        res.status( 200 ).json( json );

    }).catch(( error ) => {
        res.status( 200 ).json( error );
    });
};



module.exports = {
    init ( expressApp ) {
        expressApp.get( "/api/icims/jobs", getICIMSJobs );
    },


    auth ( req, res ) {
        getVimeoAuth( req, res );
    }
};
