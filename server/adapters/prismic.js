"use strict";



/**
 *
 * Adapter for Prismic
 * https://prismic.io
 *
 * Every adapter must have a common, public `cache` object:
 * cache: Object { api: Object, site: Object, navi: Object }
 *
 * Every adapter must have common, public `ORM` functions:
 * getApi: Function
 * getPage: Function
 * getPreview: Function
 *
 * Every adapter must have common, private `ORM` functions:
 * getSite: Function
 * getNavi: Function
 * getPartial: Function
 * getDataForApi: Function
 * getDataForPage: Function
 *
 * Different Headless CMS require slightly different approaches here.
 * Any means necessary is A-OK as long as the data resolves to the ORM format.
 *
 *
 */
const path = require( "path" );
const prismic = require( "prismic-javascript" );
const cache = {
    api: null,
    site: null,
    navi: null,
    footer: null
};
const core = {
    config: require( "../../clutch.config" ),
    template: require( "../core/template" )
};
const ContextObject = require( "../class/ContextObject" );
const apiOptions = (core.config.api.token ? { accessToken: core.config.api.token } : null);
const fetchFields = require( "../fetchFields" );



/**
 *
 * Handle API requests.
 *
 */
const getApi = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        getDataForApi( req, listener ).then(( json ) => {
            const data = {};
            const collection = cache.collections.find(( collection ) => {
                return (collection.uid === req.params.type);
            });

            // Single document for /:type/:uid
            if ( req.params.uid ) {
                data.document = getDoc( req.params.uid, json.results );

            // All documents for /:type
            } else {
                data.documents = json.results;

                // If collection page exists
                if ( collection ) {
                    data.document = collection;
                }
            }

            // Pagination information
            // console.log( json );
            data.pagination = {
                page: json.page,
                results_per_page: json.results_per_page,
                results_size: json.results_size,
                total_results_size: json.total_results_size,
                total_pages: json.total_pages,
                next_page: json.next_page,
                prev_page: json.prev_page
            }

            // Render partial for ?format=html&template=foo
            if ( req.query.format === "html" ) {
                getPartial( req, data, listener ).then(( html ) => {
                    resolve( html );
                });

            } else {
                resolve( data );
            }

        }).catch(( error ) => {
            // Resolve error as JSON result
            resolve( error );
        });
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        getDataForPage( req, listener ).then(( json ) => {
            resolve( json );

        }).catch(( error ) => {
            reject( error );
        });
    });
};



/**
 *
 * Handle preview URLs for draft content.
 *
 */
const getPreview = function ( req, res ) {
    let resolvedUrl = "/";

    return new Promise(( resolve, reject ) => {
        const previewToken = req.query.token;
        const linkResolver = function ( doc ) {
            const type = (core.config.generate.mappings[ doc.type ] || doc.type);

            resolvedUrl = (type === "page") ? `/${doc.uid}/` : `/${type}/${doc.uid}/`;

            return resolvedUrl;
        };

        prismic.api( core.config.api.access, apiOptions ).then(( api ) => {
            api.previewSession( previewToken, linkResolver, "/", ( error, redirectUrl ) => {
                res.cookie( prismic.previewCookie, previewToken, {
                    maxAge: 60 * 30 * 1000,
                    path: "/",
                    httpOnly: false
                });

                resolve( resolvedUrl );
            });
        });
    });
};



/**
 *
 * Handle partial rendering.
 *
 */
const getPartial = function ( req, data, listener ) {
    return new Promise(( resolve, reject ) => {
        const partial = (req.query.template || req.params.type);
        const localObject = {
            context: new ContextObject( partial )
        };
        const template = path.join( core.config.template.partialsDir, `${partial}.html` );

        localObject.context.set({
            site: cache.site,
            navi: cache.navi,
            footer: cache.footer
        });

        if ( data.document ) {
            localObject.context.set( "item", data.document );
        }

        if ( data.documents ) {
            localObject.context.set( "items", data.documents );
        }

        // context?
        if ( listener && listener.handlers.context ) {
            localObject.context = listener.handlers.context( localObject.context, cache, req );
        }

        core.template.render( template, localObject )
            .then(( html ) => {
                resolve( html );
            })
            .catch(( error ) => {
                reject( error );
            });
    });
};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = function ( req ) {
    return new Promise(( resolve, reject ) => {
        prismic.api( core.config.api.access, apiOptions ).then(( api ) => {
            getForm( req, api, "clutch" ).fetchLinks( fetchFields ).submit().then(( json ) => {
                const document = json.results.find(( doc ) => {
                    return (doc.type === "site");
                });
                const pages = json.results.filter(( doc ) => {
                    return (doc.type === "page");
                });
                const navi = {
                    items: []
                };
                const site = {
                    data: {}
                };
                const footer = {
                    data: {}
                };

                // Normalize site context
                for ( let i in document.data ) {
                    // Skip navi since we process that elsewhere...
                    if ( i !== "navi" && i !== "footer" ) {
                        // Handle `null` values...
                        if ( !document.data[ i ] ) {
                            site.data[ i ] = "";

                        // Handle `string` values...
                        } else {
                            site.data[ i ] = document.data[ i ];
                        }
                    }
                }

                // Normalize navi context
                document.data.navi.forEach(( slice ) => {
                    let slug = slice.primary.page.uid;

                    if ( slug === core.config.homepage ) {
                        slug = "/";

                    } else {
                        slug = `/${slug}/`;
                    }

                    navi.items.push({
                        id: slice.primary.page.id || "",
                        uid: slice.primary.page.uid || slice.primary.slug,
                        type: slice.primary.page.type || slice.primary.slug,
                        slug,
                        title: slice.primary.name
                    });
                });

                // Normalize footer Context
                footer.data = document.data.footer[ 0 ];

                cache.api = api;
                cache.site = site;
                cache.navi = navi;
                cache.footer = footer;
                cache.collections = pages.filter(( doc ) => {
                    return cache.api.data.forms[ doc.uid ];
                });

                resolve();
            });
        });
    });
};



/**
 *
 * Mapping for `site.navi` links referencing `Page` documents
 *
 */
const getNavi = function ( type ) {
    let ret = false;

    cache.navi.items.forEach(( item ) => {
        if ( item.uid === type ) {
            ret = item;
        }
    });

    // Legal pages like `Privacy`
    cache.site.data.legal_pages.forEach(( page ) => {
        if ( page.legal_page.uid === type ) {
            ret = page.legal_page;
        }
    });

    // Category pages like `Aviation`
    cache.site.data.category_pages.forEach(( page ) => {
        if ( page.category_page.uid === type ) {
            ret = page.category_page;
        }
    });

    return ret;
};



/**
 *
 * Load data for API response. Resolve RAW from Service.
 *
 */
const getDataForApi = function ( req, listener ) {
    return new Promise(( resolve, reject ) => {
        const doQuery = function ( type ) {
            prismic.api( core.config.api.access, apiOptions ).then(( api ) => {
                const done = function ( json ) {
                    resolve( json );
                };
                const fail = function ( error ) {
                    resolve({
                        error: error
                    });
                };
                const form = getForm( req, api, type );
                let query = [];

                // query: type?
                if ( !api.data.forms[ type ] ) {
                    // Only if type? is NOT a search form collection
                    query.push( prismic.Predicates.at( "document.type", type ) );
                }

                // @hook: query
                if ( listener && listener.handlers.query ) {
                    query = listener.handlers.query( prismic, api, query, cache, req );
                }

                // query: promise?
                if ( query instanceof Promise ) {
                    query.then( done ).catch( fail );

                } else {
                    // query?
                    if ( query.length ) {
                        form.query( query );
                    }

                    // @hook: orderings
                    if ( listener && listener.handlers.orderings ) {
                        listener.handlers.orderings( prismic, cache.api, form, cache, req );
                    }

                    // @hook: fetchLinks
                    if ( listener && listener.handlers.fetchLinks ) {
                        listener.handlers.fetchLinks( prismic, cache.api, form, cache, req );
                    }

                    // @hook: pagination
                    if ( listener && listener.handlers.pagination ) {
                        listener.handlers.pagination( prismic, cache.api, form, cache, req );
                    }

                    // submit
                    form.submit().then( done ).catch( fail );
                }
            });
        };

        doQuery( req.params.type );
    });
};



/**
 *
 * Load data for Page response.
 *
 */
const getDataForPage = function ( req, listener ) {
    return new Promise(( resolve, reject ) => {
        const data = {
            item: null,
            items: null
        };
        const doQuery = function ( type, uid ) {
            let query = [];
            const navi = getNavi( type );
            const form = getForm( req, cache.api, type );
            const isHeadlessHome = (type === core.config.homepage);
            const isNaviNoForm = (navi && !cache.api.data.forms[ type ]);
            const collection = cache.collections.find(( collection ) => {
                return (collection.uid === type);
            });
            const done = function ( json ) {
                if ( !json.results.length && !collection ) {
                    // Static page with no CMS data attached to it...
                    if ( core.template.cache.pages.indexOf( `${type}.html` ) !== -1 ) {
                        resolve( data );

                    } else {
                        reject( `Prismic has no data for the content-type "${type}".` );
                    }

                } else {
                    // uid
                    if ( uid || isNaviNoForm || isHeadlessHome ) {
                        data.item = getDoc( (isHeadlessHome ? core.config.homepage : (isNaviNoForm ? navi.uid : uid)), json.results );

                        if ( !data.item ) {
                            reject( `The document with UID "${isNaviNoForm ? navi.uid : uid}" could not be found by Prismic.` );
                        }

                    } else {
                        // all
                        data.items = json.results;

                        // collection
                        if ( collection ) {
                            data.item = collection;
                        }
                    }

                    resolve( data );
                }
            };
            const fail = function ( error ) {
                reject( error );
            };

            // query: type?
            if ( isHeadlessHome ) {
                query.push( prismic.Predicates.at( "document.type", "page" ) );
                query.push( prismic.Predicates.at( "my.page.uid", core.config.homepage ) );

            } else if ( isNaviNoForm ) {
                query.push( prismic.Predicates.at( "document.type", navi.type ) );
                query.push( prismic.Predicates.at( "document.id", navi.id ) );

            } else if ( !cache.api.data.forms[ type ] ) {
                // Only if type? is NOT a search form collection
                query.push( prismic.Predicates.at( "document.type", type ) );
            }

            // @hook: query
            if ( listener && listener.handlers.query ) {
                query = listener.handlers.query( prismic, cache.api, query, cache, req );
            }

            // query: promise?
            if ( query instanceof Promise ) {
                query.then( done ).catch( fail );

            } else {
                // query?
                if ( query.length ) {
                    form.query( query );
                }

                // @hook: orderings
                if ( listener && listener.handlers.orderings ) {
                    listener.handlers.orderings( prismic, cache.api, form, cache, req );
                }

                // @hook: fetchLinks
                if ( listener && listener.handlers.fetchLinks ) {
                    listener.handlers.fetchLinks( prismic, cache.api, form, cache, req );
                }

                // @hook: pagination
                if ( listener && listener.handlers.pagination ) {
                    listener.handlers.pagination( prismic, cache.api, form, cache, req );
                }

                // submit
                form.submit().then( done ).catch( fail );
            }
        };

        if ( !req.params.type ) {
            resolve( data );

        } else {
            doQuery( req.params.type, req.params.uid );
        }
    });
};



/**
 *
 * Get valid `ref` for Prismic API data ( handles previews ).
 *
 */
const getRef = function ( req, api ) {
    let ref = api.master();

    if ( req && req.cookies && req.cookies[ prismic.previewCookie ] ) {
        ref = req.cookies[ prismic.previewCookie ];
    }

    return ref;
};



/**
 *
 * Get one document from all documents.
 *
 */
const getDoc = function ( uid, documents ) {
    return documents.find(( doc ) => {
        return (doc.uid === uid);
    });
};



/**
 *
 * Get the stub of the search form.
 *
 */
const getForm = function ( req, api, collection ) {
    const form = api.data.forms[ collection ] ? collection : "everything";

    return api.form( form ).pageSize( core.config.pagination.allSize ).ref( getRef( req, api ) );
};



module.exports = {
    cache,
    getApi,
    getSite,
    getPage,
    getPreview
};
