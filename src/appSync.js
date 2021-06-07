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
            this.log("C-1 app isready and was executed ! (appready triggered)");
            this.trigger("appready");
            this.log("C-2 router started");
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

        // listening false used to do not reload app if any related list is reloaded by some view or model
        // fetch is here instead of being on initialize because appview can add global dependencies
        if (!this.fetchRelatedLists({ listening: false })) {
            this.triggerReady();
        }
    },
    allDone() {
        return this.executed === 9;
    },
    // primeiro metodo executado apos o app.start do marionette
    onStart() {
        var AppView = this.options.AppView;
        this.appView = new AppView({ App: this });

        this._loadId = vx.ux.loading.add("");
        vx.debug.globalify("app", this);
        // remove loading somente quando a appview estiver exibida
        vx.utils.when(
            () => {
                this.log("Z waiting appView.isTrullyVisible");
                return this.appView.isTrullyVisible;
            },
            () => {
                vx.ux.loading.remove(this._loadId);
                this.executed = 9;
            },
            50
        );

        this.appView.$el.hide();
        vx.utils.when(
            () => {
                this.log("B-0 waiting appview.template and appview.isready");
                return (
                    _.indexOf(
                        ["function", "string"],
                        typeof this.appView.template
                    ) !== -1 &&
                    (!this.appView.isReady || this.appView.isReady() === true)
                );
            },
            () => {
                this.log("B-1 showview set");
                // acontece antes do App.execute
                this.showView(this.appView);
                this.appViewAttached = true;
            },
            30
        );
    },
    showContent(view) {
        this.log("F-0 showcontent called");
        vx.utils.when(
            () => {
                this.log("F-1 waiting view");
                return this.getView();
            },
            () => {
                this.log("F-2 showcontent executed");
                this.isLoggedEvents();
                var viewObj = typeof view === "object" ? view : null;

                if (this.getView().getRegion("content")) {
                    this.getView().getRegion("content").show(viewObj);

                    if (!this.appView.$el.is(":visible")) {
                        this.log("F-3 show appview");
                        this.appView.$el.show();
                    }
                }
            },
            30
        );
    },
});
