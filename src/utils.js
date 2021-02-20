import _ from "underscore-99xp";
import vx from "backbone-front-99xp";

import uxLoading from "front-99xp/src/ux/loading";
import Masks from "front-99xp/src/masks/igorescobar";

var obj = {
    Masks,
};

obj.removeWrapper = function () {
    if ("wrapperRemoved" in this) return this;
    // Get rid of that pesky wrapping-div.
    // Assumes 1 child element present in template.
    this.$el = this.$el.children();
    // Unwrap the element to prevent infinitely
    // nesting elements during re-render.
    this.$el.unwrap();
    this.setElement(this.$el);
    this.wrapperRemoved = true;
};

obj.areReadyModelAndCollection = function () {
    var s = true;
    if (this.model && !this.model.isReady() === true) {
        if (this.model.infoRelatedReady) s = [-31, this.model.infoRelatedReady];
        s = -3;
    }
    if (this.collection && !this.collection.isReady() === true) {
        if (this.collection.infoRelatedReady)
            s = [-41, this.collection.infoRelatedReady];
        if (this.collection.infoModelsReady)
            s = [-42, this.collection.infoModelsReady];
        s = -4;
    }
    return s;
};

obj.isReady = function () {
    var s = true,
        modelAndCollectionReady = this.areReadyModelAndCollection();

    if (this.waitToRender) s = -1;
    else if (!typeof this.template === "function") s = -2;
    else if (modelAndCollectionReady !== true) s = modelAndCollectionReady;
    else if (
        "isAllRelatedReady" in this &&
        !this.isAllRelatedReady() === true
    ) {
        if (this.infoRelatedReady) s = [-51, this.infoRelatedReady];
        s = -5;
    }
    typeof s === "number" && (s = [s]);

    return s;

    // if (!this.waitToRender &&
    //         typeof this.template === 'function' &&
    //         (!this.model || this.model.isReady()===true) &&
    //         (!this.collection || this.collection.isReady()===true) &&
    //         (!('isAllRelatedReady' in this) || this.isAllRelatedReady())) {
    //     return true;
    // }
    // return false;
};

// actions
obj.viewActions = {
    getDefaultActions() {
        return [];
    },
    getCustomActions() {
        return [];
    },
    getActions() {
        return _.union(this.getDefaultActions(), this.getCustomActions());
    },
    setActions() {
        var actions = this.formatActions(),
            l = [];

        for (let action of actions) {
            l.push(action);
        }

        this.showActions(l);
    },
    formatActions() {
        if (!("moduleName" in this)) return []; // view loaded not by routing

        var alias = this.alias,
            actions = this.getActions();

        var actionData = this;

        for (let x in actions) {
            "navigate" in actions[x] &&
                (actions[x]["navigate"] = _.template(actions[x]["navigate"])(
                    actionData
                ));
            "route" in actions[x] &&
                (actions[x]["route"] = _.template(actions[x]["route"])(
                    actionData
                ));
            "auth" in actions[x] &&
                (actions[x]["auth"] = _.template(actions[x]["auth"])(
                    actionData
                ));
        }

        return actions;
    },
    formatNavigateUrl(tpl) {
        var actionData = this;
        return _.template(tpl)(actionData);
    },
    showActions(actions = null) {
        typeof vx.app().getView() === "object" &&
            "setActions" in vx.app().getView() &&
            vx.app().getView().setActions(actions, this);
    },
};

// loading

obj.viewLoading = Object.freeze({
    _loadingIds: {},
    _loadingExecution: {},
    _isSubmitting: false,
    _loadingText: " ",
    isSubmitting() {
        return !!this._isSubmitting;
    },
    isLoadingExecuting(uniqId) {
        return !!this._loadingExecution[uniqId];
    },
    addLoading(text, uniqId) {
        if (this.isLoadingExecuting(uniqId) === false) {
            this._loadingIds[uniqId] = uxLoading.add(text || this._loadingText);
            this._loadingExecution[uniqId] = true;
        }
    },
    removeLoading(uniqId, timeout = 0) {
        if (this.isLoadingExecuting(uniqId) === true) {
            setTimeout(() => {
                uxLoading.remove(this._loadingIds[uniqId]);
                this._loadingExecution[uniqId] = false;
            }, timeout);
        }
    },
    addSubmitLoading(text) {
        this.addLoading(text, "submit");
        // if(this.isSubmitting()===false) {
        //     this._loadIdSubmitting = uxLoading.add(text || this._loadingText);
        //     this._isSubmitting = true;
        // }
    },
    removeSubmitLoading() {
        this.removeLoading("submit", 400);
        // if(this.isSubmitting()===true) {
        //     uxLoading.remove(this._loadIdSubmitting);
        //     this._isSubmitting = false;
        // }
    },
});

obj.viewScroll = Object.freeze({
    getHeaderHeight() {
        return $("header").height();
    },
    getScrollTopOffset() {
        return this.$el.offset()["top"];
    },
    getScrollTopPos() {
        return this.getScrollTopOffset() - this.getHeaderHeight();
    },
    scrollTopDelay: 500,
    scrollTopEffect: "swing",
    afterScrollTop() {},
    scrollTop() {
        var body = $("html, body");
        body.stop().animate(
            { scrollTop: this.getScrollTopPos() },
            this.scrollTopDelay,
            this.scrollTopEffect,
            _.bind(this.afterScrollTop, this)
        );
    },
});

export default obj;
