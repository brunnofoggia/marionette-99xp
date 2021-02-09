import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import Mn from "backbone.marionette";
import utils from "./utils";

var obj = {
    model: {},
    collection: {},
    view: {},
    app: {},
    model_prototype: {},
    collection_prototype: {},
    view_prototype: {},
    app_prototype: {},
};

obj.view_prototype._render = Mn.View.prototype.render;

obj.view_prototype.waitToRender = false;
obj.view_prototype.renderStatus = false;
obj.view_prototype.renderTimer = null;
obj.view_prototype._firstRender = true;

obj.view_prototype.renderSync = function () {
    this.addLoading && this.addLoading("", "renderSync");
    var isReadyFn = _.bind(this.isReady ? this.isReady : utils.isReady, this),
        isReady = isReadyFn();

    clearTimeout(this.renderTimer);
    this.renderTimer = null;
    if (isReady === true) {
        this.removeLoading && this.removeLoading("renderSync", 0);
        this.renderStatus = true;
        // _.bind(obj.view_prototype._render, this)();
        this._render();
    } else if (this.renderTimer === null) {
        this.renderTimer = setTimeout(() => {
            vx.debug.log(`interval insure ${isReady[0]} -${isReady[1] || "-"}`);
            this.render();
        }, 500);
    }
    return this;
};

obj.view_prototype.templates = {};
obj.view_prototype.renderPartial = function (viewName, opts = {}) {
    return this.templates[viewName](_.extend(this.serializeData(), opts));
};

obj.view_prototype.serializeData = function () {
    var App = vx.locate("iApp");
    return {
        App,
        vx,
        _,
        view: this,
        model: this.model,
        collection: this.collection,
        relatedLists: this.relatedLists || {},
        options: this.options,
        cid: this.cid,
        renderPartial: (viewName, opts) => this.renderPartial(viewName, opts),
    };
};

export default obj;
