const request = require( "request-promise" );
const authorization = {
    config: require( "../../sandbox/authorizations/icims.config" )
};



const getICIMSBuff = () => {
    return Buffer.from( `${authorization.config.clientId}:${authorization.config.clientSecret}` ).toString( "base64" );
};
const getICIMSJobs = ( req, res ) => {
    request({
        url: `https://api.icims.com/customers/${authorization.config.customerId}`,
        json: true,
        method: "GET",
        headers: {
            "Authorization": `Basic ${getICIMSBuff()}`
        }

    }).then(( json ) => {
        res.status( 200 ).json( json );
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
