import Bb from 'backbone';
import Mn from 'backbone.marionette';
import vx from 'front-99xp';
import _ from 'underscore-99xp';
import bbx from 'backbone-99xp';

import uxLoading from 'front-99xp/src/ux/loading';

import locator from './locator';
import pretriggers from './pretriggers';
import render from './render';
import utils from './utils';

var mnx = {};

mnx.view = Mn.View.extend();
mnx.cview = Mn.CollectionView.extend();
mnx.app = Mn.Application.extend();
mnx.region = Mn.Region.extend();
mnx.behavior = Mn.Behavior.extend();


// locator
mnx.locator = locator;
for(let x in locator['view']) {
	mnx.view[x] = locator['view'][x];
}

for(let x in locator['app']) {
	mnx.app[x] = locator['app'][x];
}

for(let x in locator['app_prototype']) {
	mnx.app.prototype[x] = locator['app_prototype'][x];
}

// pretriggers
mnx.view.prototype.pretriggers = [];
for(let x in pretriggers['view_prototype']) {
	mnx.view.prototype[x] = pretriggers['view_prototype'][x];
}

// render
for(let x in render['view_prototype']) {
	mnx.view.prototype[x] = render['view_prototype'][x];
}


// security
mnx.view.Shield = mnx.cview.Shield = bbx.view.Shield;

// state
mnx.view.prototype.getRelatedList = bbx.view.prototype.getRelatedList;
mnx.view.prototype.pretriggers.push(bbx.view.pretrigger_initialState);


mnx.view.prototype.pretriggers.push(bbx.view.pretrigger_collectionInstantiate);

mnx.view.prototype.isAllRelatedReady = bbx.view.prototype.isAllRelatedReady;

mnx.view.prototype.triggerReady = bbx.view.prototype.triggerReady;

mnx.view.prototype.addRelatedList = bbx.view.prototype.addRelatedList;

mnx.view.prototype.storeRelatedList = bbx.view.prototype.storeRelatedList;

mnx.view.prototype._fetchRelatedFirst = bbx.view.prototype._fetchRelatedFirst;
mnx.view.prototype.fetchAndStateRelatedList = bbx.view.prototype.fetchAndStateRelatedList;

mnx.view.prototype.fetchRelatedLists = bbx.view.prototype.fetchRelatedLists;
mnx.view.prototype.listenPairOnce = bbx.view.prototype.listenPairOnce;

// utils
mnx.utils = utils;

export default mnx;