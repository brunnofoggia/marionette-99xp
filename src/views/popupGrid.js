import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../marionette';

import template from '../templates/grid.jst';
import legendTemplate from '../templates/legend.jst';
import filterView from './filter';
import listView from './list';
import paginationView from './pagination';
import authUnit from './authUnit';
import gridView from './grid';

import popupView from './popupView';
import actionBarView from './actionBar';
import 'jquery-mask-plugin';
import Masks from '../../masks/igorescobar';

var _ = vx._;


export default popupView.extend({
    templateBody: template,
    regions: {
        'header': '.modal-header',
        'body': '.modal-body',
        'footer': '.modal-footer',
        filter: '.filter',
        list: '.list',
        pagination: '.pagination',
        legend: '.legend',
    },
    isReady: mnx.utils.isReady,
    provideResults: gridView.prototype.provideResults,
    sortResults: gridView.prototype.sortResults,
    sortType: gridView.prototype.sortType,
    showActions(actions) {
        this.getRegion('footer').currentView.setActions(actions, this);
    },
    initialize() {
        _.bind(popupView.prototype.initialize, this)();
        _.bind(gridView.prototype.initialize, this)();
    },
    renderBody() {
        $('*', this.getRegion('body').$el).remove();
        this.getRegion('body').$el.append(this.templateBody(this.serializeData()));
        
        this.afterRender && this.afterRender();
    },
    getDefaultActions() {
        return [
            {ico: 'save', btnColor: 'primary text-light', title: 'Salvar', callback: (e)=>this.save(e), auth: '{{moduleName}}/form'}
        ];
    },
});