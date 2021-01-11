import Mn from 'backbone.marionette';
import _ from 'underscore-99xp';
import bbxf from 'backbone-front-99xp';

import app from './app';
import locator from './locator';
import render from './render';
import utils from './utils';

var mnx = {};

mnx.view = Mn.View.extend(_.extend({},_.clone(utils.viewLoading), _.clone(utils.viewScroll)));
mnx.cview = Mn.CollectionView.extend(_.extend({},_.clone(utils.viewLoading), _.clone(utils.viewScroll)));
mnx.app = app;
mnx.region = Mn.Region.extend();
mnx.behavior = Mn.Behavior.extend();


// locator
mnx.locator = locator;
for(let x in locator['view']) {
	mnx.view[x] = locator['view'][x];
	mnx.cview[x] = locator['view'][x];
}

for(let x in locator['app']) {
	mnx.app[x] = locator['app'][x];
}

for(let x in locator['app_prototype']) {
	mnx.app.prototype[x] = locator['app_prototype'][x];
}

// pretriggers
mnx.view.prototype.pretriggers = [];
mnx.view.prototype.preinitialize = function () {
    if (this.pretriggers.length > 0) {
        for (let trigger of this.pretriggers) {
            _.bind(trigger, this)();
        }
    }
}

// render
for(let x in render['view_prototype']) {
	mnx.view.prototype[x] = render['view_prototype'][x];
}


// security
mnx.view.Shield = mnx.cview.Shield = bbxf.view.Shield;

// state
mnx.view.prototype.getRelatedList = bbxf.view.prototype.getRelatedList;
mnx.view.prototype.pretriggers.push(bbxf.view.pretrigger_initialState);


mnx.view.prototype.pretriggers.push(bbxf.view.pretrigger_collectionInstantiate);

mnx.view.prototype.isAllRelatedReady = bbxf.view.prototype.isAllRelatedReady;

mnx.view.prototype.triggerReady = bbxf.view.prototype.triggerReady;

mnx.view.prototype.addRelatedList = bbxf.view.prototype.addRelatedList;

mnx.view.prototype.storeRelatedList = bbxf.view.prototype.storeRelatedList;

mnx.view.prototype._fetchRelatedFirst = bbxf.view.prototype._fetchRelatedFirst;
mnx.view.prototype.fetchAndStateRelatedList = bbxf.view.prototype.fetchAndStateRelatedList;

mnx.view.prototype.fetchRelatedLists = bbxf.view.prototype.fetchRelatedLists;
mnx.view.prototype.listenToOnce = bbxf.view.prototype.listenToOnce;

// utils
mnx.utils = utils;

export default mnx;
