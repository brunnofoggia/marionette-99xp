import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import Bb from "backbone";
import App from "./app";
import utils from "./utils";

export default App.extend({
    executed: 0,
    relatedLists: {},
    isAllRelatedReady: vx.view.prototype.isAllRelatedReady,
    fetchRelatedLists(opts = {}) {
        if (!vx.app()) {
            return setTimeout(() => this.fetchRelatedLists(opts), 10);
        }
        return _.bind(vx.view.prototype.fetchRelatedLists, this)(opts);
    },
    fetchAndStateRelatedList(name, opts = {}) {
        if (!vx.app()) {
            return setTimeout(
                () => this.fetchAndStateRelatedList(name, opts),
                10
            );
        }
        return _.bind(vx.view.prototype.fetchAndStateRelatedList, this)(
            name,
            opts
        );
    },
    isReady() {
        return this.isAllRelatedReady();
    },
    triggerReady() {
        var isReady = this.isReady() && this.executed === 1;

        if (isReady === true) {
            this.executed = 2;
            this.trigger("appready");
            this.startRouter();
        }

        return isReady;
    },
    execute() {
        this.executed = 1;
        this.triggerReady();
    },
    initialize(o) {
        this.online = true;

        vx.debug.globalify("_", _);
        vx.debug.globalify("$", $);
        vx.debug.globalify("vx", vx);

        // listening false used to do not reaload app if any related list is reloaded by some view or model
        // fetch is here instead of being on initialize because appview can add global dependencies
        if (!this.fetchRelatedLists({ listening: false })) {
            this.triggerReady();
        }
    },
    // primeiro metodo executado apos o app.start do marionette
    onStart() {
        var AppView = this.options.AppView;
        this.appView = new AppView({ App: this });

        this._loadId = vx.ux.loading.add(
            vx.environment() < vx.constants.env.staging ? "App is loading" : ""
        );
        vx.debug.globalify("app", this);
        // remove loading somente quando a appview estiver exibida
        vx.utils.when(
            () => {
                vx.debug.log("waiting appView.isTrullyVisible");
                return this.appView.isTrullyVisible;
            },
            () => {
                vx.ux.loading.remove(this._loadId);
            }
        );

        this.appView.$el.hide();
        vx.utils.when(
            () =>
                typeof this.appView.template == "function" &&
                (!this.appView.isReady || this.appView.isReady() === true),
            () => {
                vx.debug.log("showview set");
                // acontece antes do App.execute
                this.showView(this.appView);
                this.appViewAttached = true;
            }
        );
    },
    showContent(view) {
        vx.debug.log("showcontent called");
        vx.utils.when(
            () => this.getView(),
            () => {
                vx.debug.log("showcontent executed");
                this.isLoggedEvents();
                var viewObj = typeof view === "object" ? view : null;

                if (this.getView().getRegion("content")) {
                    this.getView().getRegion("content").show(viewObj);

                    if (!this.appView.$el.is(":visible")) {
                        vx.debug.log("show appview");
                        this.appView.$el.show();
                    }
                }
            }
        );
    },
});
