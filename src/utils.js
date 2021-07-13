import _ from "underscore-99xp";
import bbxf from "backbone-front-99xp";

import uxLoading from "front-99xp/src/ux/loading";
import Masks from "front-99xp/src/masks/igorescobar";

var obj = {
    Masks,
};

obj.removeWrapper = function () {
    if ("wrapperRemoved" in this) return this; // this is very important addition made by my oldself. do not use removewrapper2 unless you are 120% sure of it
    // Get rid of that pesky wrapping-div.
    // Assumes 1 child element present in template.
    this.$el = this.$el.children();
    // Unwrap the element to prevent infinitely
    // nesting elements during re-render.
    this.$el.unwrap();
    this.setElement(this.$el);
    this.wrapperRemoved = true;
};

obj.removeWrapper2 = function () {
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

obj.areWrongModelOrCollection = function () {
    var s = false;
    if (this.model && this.model.isWrong() !== false) {
        if (this.model.infoRelatedReady) s = [-31, this.model.infoRelatedReady];
        s = -3;
    }
    if (this.collection && this.collection.isWrong() !== false) {
        if (this.collection.infoRelatedReady)
            s = [-41, this.collection.infoRelatedReady];
        if (this.collection.infoModelsReady)
            s = [-42, this.collection.infoModelsReady];
        s = -4;
    }
    return s;
};

obj.isWrong = function () {
    var s = false,
        areWrongModelOrCollection = this.areWrongModelOrCollection();

    if (areWrongModelOrCollection !== false) s = areWrongModelOrCollection;
    else if ("isAnyListWrong" in this && this.isAnyListWrong() !== false) {
        if (this.infoRelatedWrong) s = [-51, this.infoRelatedWrong];
        s = -5;
    }
    typeof s === "number" && (s = [s]);

    return s;
};

// actions
obj.viewActions = {
    getDefaultActions() {
        return [];
    },
    getCustomActions() {
        return [];
    },
    getActions(place = 0) {
        return _.union(
            this.getDefaultActions(place),
            this.getCustomActions(place)
        );
    },
    setActions() {
        var actions = this.formatActions(),
            l = [];

        for (let action of actions) {
            l.push(action);
        }

        this.showActions(l);
    },
    formatActions(actions) {
        if (!("moduleName" in this)) return []; // view loaded not by routing

        var alias = this.alias;
        !actions && (actions = this.getActions());

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
    actionsOptions: {
        addSpanForTitle: true,
        addClass: "text-2",
    },
    getActionsOptions(actions) {
        return _.extend(this.actionsOptions || {}, { context: this });
    },
    showActions(actions = null) {
        if ("actions" in this.regions) {
            return this.showActionsInside(actions);
        }
        if (this !== bbxf.app().getView())
            return this.showActionsOnApp(actions);
    },
    showActionsOnApp(actions = null) {
        typeof bbxf.app().getView() === "object" &&
            "showActions" in bbxf.app().getView() &&
            bbxf
                .app()
                .getView()
                .showActions(actions, this.getActionsOptions(actions));
    },
    showActionsInside(actions = null) {
        const ActionBar = bbxf.mnx.views.actionBar;
        const actionBar = new ActionBar();
        this.showChildView(
            "actions",
            actionBar.setActions(actions, this.getActionsOptions(actions))
        );
        this.customizeActionsInside(actions);
        $(".actions", this.$el).removeClass("d-none");
    },
    renderInlineActions(actions) {
        const ActionBar = bbxf.mnx.views.actionBar;
        const actionBar = new ActionBar().setActions(
            actions,
            this.getActionsOptions(actions)
        );

        return actionBar;
    },
    showActionsInline(actions, actionsCol) {
        var o = this.getActionsOptions(actions);
        !actionsCol && (actionsCol = o.actionsCol);

        var $table = $("table", this.$el),
            $cols = $('tr td[data-name="' + actionsCol + '"]', $table);

        if (!$cols.length) return;
        $cols.each((x, col) => {
            var $col = $(col),
                actionBar = this.renderInlineActions(actions);
            $col.html("").append(actionBar.$el);
        });
    },
    customizeActionsInside(actions = null) {
        var $actions = $(".actions", this.$el);
        $actions.addClass("text-right");
        !$actions.parents(".breadcrumb-container:first").length &&
            $actions.addClass("mb-4");
    },
    breadcrumbText: "",
    breadcrumbTag: "h2",
    breadcrumbCssClass: "col-12 col-md-auto text-left",
    breadcrumbContainerCssClass: "text-1 text-md-3",
    breadcrumbActionsCssClass: "col-12 col-lg text-right mt-3 mt-lg-0",
    getBreadcrumbText() {
        return _.result(this, "breadcrumbText") || "";
    },
    getBreadcrumbTag() {
        return this.breadcrumbTag || "div";
    },
    getBreadcrumbCssClass() {
        return this.breadcrumbCssClass || "";
    },
    getBreadcrumbContainerCssClass() {
        return this.breadcrumbContainerCssClass || "";
    },
    getBreadcrumbActionsCssClass() {
        return this.breadcrumbActionsCssClass || "";
    },
    showBreadcrumb(text) {
        !text && (text = this.getBreadcrumbText());
        if (this.getBreadcrumbContainer()) {
            return this.showBreadcrumbInside(text);
        }

        if (this !== bbxf.app().getView())
            return this.showBreadcrumbOnApp(text);
    },
    getBreadcrumbContainer() {
        return $(".breadcrumb-container", this.$el).length
            ? $(".breadcrumb-container", this.$el)
            : null;
    },
    showBreadcrumbOnApp(text = "") {
        typeof bbxf.app().getView() === "object" &&
            "showBreadcrumb" in bbxf.app().getView() &&
            bbxf.app().getView().showBreadcrumb(text);
    },
    showBreadcrumbInside(text = "") {
        var $breadcrumb = this.getBreadcrumbContainer();
        $(".breadcrumb-text", $breadcrumb).remove();
        $(
            `<${this.getBreadcrumbTag()} class="${this.getBreadcrumbCssClass()}">`
        )
            .addClass("breadcrumb-text")
            .html(text)
            .prependTo($breadcrumb);
        this.customizeBreadcrumbInside(text);
        $breadcrumb.removeClass("d-none");
    },
    customizeBreadcrumbInside(text = "") {
        var $breadcrumb = this.getBreadcrumbContainer();
        $breadcrumb.addClass("mb-4");
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

obj.log = {
    log() {
        var args = Array.from(arguments);
        !!this.logs && bbxf.debug.log.apply(bbxf.debug, args);
    },
};

export default obj;
