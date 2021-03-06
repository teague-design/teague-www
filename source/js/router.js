import $ from "properjs-hobo";
// import Controller from "properjs-controller";
import PageController from "properjs-pagecontroller";
import Controllers from "./class/Controllers";
import * as core from "./core";
import navi from "./modules/navi";



/**
 *
 * @public
 * @namespace router
 * @description Handles async web app routing for nice transitions.
 *
 */
const router = {
    init () {
        this.bigpink = core.dom.body.find( ".js-bigpink" );
        this.bigpinkTitle = this.bigpink.find( ".js-bigpink-title" );
        this.bigpinkTag = this.bigpink.find( ".js-bigpink-tag" );
        this.bigpinkData = this.bigpink.data();
        this.animDuration = 500;
        this.controllers = new Controllers({
            el: core.dom.main,
            cb: () => {
                this.topper();
            }
        });

        // Transition page state stuff
        this.state = {
            now: null,
            future: null
        };

        // Theme classNames
        this.themes = {
            white: "is-theme-white",
            black: "is-theme-black"
        };

        // Popstate
        this.history = {
            states: {}
        };
        this.isPopstate = false;
        this.popsUrl = null;
        this.popsState = null;

        this.bindEmpty();
        this.prepPages();

        core.log( "[Router initialized]", this );
    },


    load () {
        return new Promise(( resolve ) => {
            this.controller = new PageController({
                transitionTime: this.animDuration,
                routerOptions: {
                    async: true
                }
            });

            this.controller.setConfig([
                "/",
                ":view",
                ":view/:uid"
            ]);

            this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
            this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
            this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
            this.controller.on( "page-controller-initialized-page", ( data ) => {
                this.initPage( data );
                this.csrf = core.dom.main.data().csrf;
                this.controller.getPusher().on( "popstate", this.handlePops.bind( this ) );
                resolve();
            });
            this.controller.initPage();
        });
    },


    handlePops ( url, state ) {
        this.isPopstate = true;
        this.popsUrl = url;
        this.popsState = state;
    },


    bindEmpty () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    prepPages () {
        this.controllers.exec();
    },


    initPage ( data ) {
        this.setDoc( data );
        this.setState( "now", data );
        this.setState( "future", data );
        this.setClass();
        navi.active( this.state.future.view );
        this.history.states[ window.location.href ] = this.bigpinkData;
    },


    parseDoc ( html ) {
        let doc = document.createElement( "html" );
        let main = null;
        let data = null;

        doc.innerHTML = html;

        doc = $( doc );
        main = doc.find( core.config.mainSelector );
        data = main.data();

        this.csrf = data.csrf;

        return {
            doc,
            main,
            data,
            html: main[ 0 ].innerHTML
        };
    },


    setDoc ( data ) {
        this.doc = this.parseDoc( data.response );
    },


    setState ( time, data ) {
        this.state[ time ] = {
            raw: data,
            uid: data.request.params.uid || null,
            view: data.request.params.view || core.config.homepage,
            tag: data.request.query.tag || null
        };
    },


    setTheme () {
        core.dom.html.removeClass( `${this.themes.white} ${this.themes.black}` );

        if ( this.doc.data.theme ) {
            core.dom.html.addClass( this.themes[ this.doc.data.theme ] );
        }
    },


    setClass () {
        if ( this.state.future.view ) {
            core.dom.html.addClass( `is-${this.state.future.view}-page` );
        }

        if ( this.state.future.uid ) {
            core.dom.html.addClass( `is-uid-page` );
        }

        if ( this.state.future.tag ) {
            core.dom.html.addClass( `is-tag-page` );
        }
    },


    unsetClass () {
        if ( this.state.now.view !== this.state.future.view ) {
            core.dom.html.removeClass( `is-${this.state.now.view}-page` );
        }

        if ( this.state.now.uid && !this.state.future.uid ) {
            core.dom.html.removeClass( `is-uid-page` );
        }

        if ( this.state.now.tag && !this.state.future.tag ) {
            core.dom.html.removeClass( `is-tag-page` );
        }
    },


    changePageOut ( data ) {
        const activeEl = $( this.controller.getRouter().getActiveEl() );
        const activeData = activeEl.data();
        let useData = activeData;

        this.setState( "future", data );
        this.unsetClass();
        this.setClass();
        navi.close();
        navi.active( this.state.future.view );
        this.controllers.destroy();

        if ( activeData.json ) {
            if ( this.isPopstate ) {
                useData = this.history.states[ this.popsUrl ];
            }

            this.transitionOutPink( activeEl, useData );

        } else {
            this.transitionOut();
        }
    },


    changeContent ( data ) {
        this.setDoc( data );
        this.setTheme();
        core.dom.main[ 0 ].innerHTML = this.doc.html;
        this.topper();
        this.controllers.exec();
        core.emitter.fire( "app--trackpageview", this.doc );
    },


    changePageIn ( data ) {
        const activeEl = $( this.controller.getRouter().getActiveEl() );
        const activeData = activeEl.data();

        setTimeout(() => {
            this.setState( "now", data );

            if ( activeData.json ) {
                this.transitionInPink( activeEl, activeData );

            } else {
                this.transitionIn();
            }

            if ( !this.isPopstate ) {
                this.history.states[ window.location.href ] = activeData;
            }

            this.isPopstate = false;
            this.popsUrl = null;
            this.popsState = null;

        }, this.animDuration );
    },


    tweenContent ( opacity ) {
        if ( opacity === 0 ) {
            core.dom.html.addClass( "is-tranny" );

        } else {
            core.dom.html.removeClass( "is-tranny" );
        }
    },


    transitionOut () {
        this.tweenContent( 0 );
    },
    transitionOutPink ( elem, data ) {
        this.bigpinkTitle.forEach(( el ) => {
            el.innerHTML = data.json.title;
        });
        this.bigpink.removeClass( "is-hidden" ).addClass( "is-active" );

        if ( data.json.tag ) {
            this.bigpinkTag[ 0 ].innerHTML = data.json.tag;
        }

        if ( data.json.story ) {
            this.bigpink.addClass( "is-story" );
        }
    },


    transitionIn () {
        this.tweenContent( 1 );
    },
    transitionInPink ( /*elem, data*/ ) {
        this.bigpink.addClass( "is-inactive" );

        setTimeout(() => {
            this.bigpink.addClass( "is-hidden" ).removeClass( "is-active is-story is-inactive" );
            this.bigpinkTag[ 0 ].innerHTML = "&nbsp;";
            this.bigpinkTitle[ 0 ].innerHTML = "&nbsp;";

        }, 500 );
    },


    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    push ( path, cb ) {
        this.controller.routeSilently( path, () => {
            core.emitter.fire( "app--trackpageview", this.doc );

            if ( typeof cb === "function" ) {
                cb();
            }
        });
    },


    topper () {
        window.scrollTo( 0, 0 );
    }
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
