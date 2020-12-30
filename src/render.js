import _ from 'underscore-99xp';
import front from 'front-99xp';
import Mn from 'backbone.marionette';
import utils from './utils';

var obj = {model: {}, collection: {}, view: {}, app: {}, model_prototype: {}, collection_prototype: {}, view_prototype: {}, app_prototype: {}};


obj.view_prototype._render = Mn.View.prototype.render;

obj.view_prototype.waitToRender = false;
obj.view_prototype.renderStatus = false;
obj.view_prototype.renderTimer = null;
obj.view_prototype._firstRender = true;

obj.view_prototype.renderSync = function () {
//    if(this._firstRender) {
//        this._firstRender = false;
//        return;
//    }

    this.addLoading && this.addLoading('', 'renderSync');
    var isReady = _.bind((this.isReady ? this.isReady : utils.isReady), this);

    clearTimeout(this.renderTimer); this.renderTimer=null;
    if (isReady()) {
        this.removeLoading && this.removeLoading('renderSync', 0);
        this.renderStatus = true;
        // _.bind(obj.view_prototype._render, this)();
        this._render();
    } else if(this.renderTimer===null) {
        this.renderTimer = setTimeout(_.bind(function() { front.debug.log('interval insure');front.debug.log(this);this.render(); }, this), 500);
    }
    return this;
};


obj.view_prototype.templates = {};
obj.view_prototype.renderPartial = function (viewName, opts = {}) {
    return this.templates[viewName](_.extend(this.serializeData(), opts));
}

obj.view_prototype.serializeData = function () {
    var App = front.locator.getItem('iApp');
    return {
        App, _, view: this, model: this.model, collection: this.collection, 
        relatedLists: this.relatedLists || {}, options: this.options, cid: this.cid, 
        renderPartial: (viewName, opts) => this.renderPartial(viewName, opts)
    };
};

export default obj;
