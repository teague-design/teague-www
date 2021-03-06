"use strict";



const path = require( "path" );
const lager = require( "properjs-lager" );
const core = {
    query: require( "./query" ),
    config: require( "../../clutch.config" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        const page = (req.params.type ? req.params.type : core.config.homepage);
        let context = new ContextObject( page );
        const check = function ( data ) {
            // 0.0 => Missing template file
            // 0.1 => Single ContentItem
            // 0.2 => Multiple ContentItems(s)
            const isNoNamePage = (core.template.cache.pages.indexOf( `${page}.html` ) === -1);
            const isNoTypePage = data.item ? (core.template.cache.pages.indexOf( `${data.item.type}.html` ) === -1) : true;

            if ( isNoNamePage && isNoTypePage ) {
                const file = path.join( core.config.template.pagesDir, `${page}.html` );

                fail( `The template file for this path is missing at "${file}".` );

            } else {
                if ( data.item ) {
                    context.set( "item", data.item );
                }

                if ( data.items ) {
                    context.set( "items", data.items );
                }

                // context?
                if ( listener && listener.handlers.context ) {
                    context = listener.handlers.context( context, core.query.cache, req );
                }

                done();
            }
        };
        const fail = function ( error ) {
            context.set({
                page: core.config.notfound,
                error: error
            });

            done();
        };
        const done = function () {
            context.set({
                csrf: req.csrfToken ? req.csrfToken() : null,
                navi: core.query.cache.navi,
                site: core.query.cache.site,
                footer: core.query.cache.footer
            });

            resolve(( callback ) => {
                render( callback );
            });
        };
        const render = function ( callback ) {
            const localObject = {
                context: context
            };
            const item = localObject.context.get( "item" );
            const isNoNamePage = (core.template.cache.pages.indexOf( `${page}.html` ) === -1);

            if ( isNoNamePage && item ) {
                localObject.context.set( "page", item.type );
            }

            core.template.render( core.config.template.layout, localObject ).then(( html ) => {
                callback( (context.page === core.config.notfound ? 404 : 200), html );

            }).catch(( error ) => {
                renderError( callback, error );
            });
        };
        const renderError = function ( callback, error ) {
            context.set({
                page: core.config.notright,
                error: error
            });

            core.template.render( core.config.template.layout, { context: context } ).then(( html ) => {
                callback( 500, html );
            });
        };

        core.query.getPage( req, res, listener ).then( check ).catch( fail );
    });
};


module.exports = {
    getPage
};
