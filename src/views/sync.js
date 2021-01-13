import _ from 'underscore-99xp';
import vx from 'backbone-front-99xp';
import Masks from 'front-99xp/src/masks/igorescobar';
import mnx from '../define';
import autoUtilEvents from './autoUtilEvents';

export default mnx.view.extend(_.extend({}, _.clone(mnx.utils.viewActions), _.clone(autoUtilEvents), {
    initialRenderOnState: 'ready',
    renderOnState: 'ready',
    isReady: mnx.utils.isReady,
    render: mnx.view.prototype.renderSync,
    masks: Masks,
    onRender() {
        _.bind(mnx.utils.removeWrapper, this)();

        if(!this.isReady()===true) return;
        this.applyBehaviors(this.$el);

        this.isReady()===true && this.setActions();
        this.isReady()===true && this.afterRender && this.afterRender();
        this._firstRender = false;
    },
    applyBehaviors($el) {
        Sk.waitFor(()=>$.fn.tooltip, ()=>$('[data-toggle="tooltip"]', $el).tooltip());
        this.masks.apply($el);
    },
    initialize() {
        vx.debug.globalify('currentView', this);
        vx.debug.globalify('currentModel', this.model);
        this.events = _.extend(_.clone(autoUtilEvents.events), this.events);
        this.validateOnSet = false;

        this.renderListener();

        // event added to render after loading auth access
        ('addAuthAccessRelated' in this) && this.addAuthAccessRelated();
        if(!this.fetchRelatedLists() && this.isReady()===true) {
            this.render();
        }

        return this;
    },
    renderListener() {
        if(this.model) {
            this.model.errorsMap = {};
            if (this.options.id) {
                if (this.model.morphState === this.renderOnState)
                    this.render();
                else {
    //                this.listenToOnce(this.model, this.renderOnState, () => { this.render(); });
                    this.listenTo(this.model, this.renderOnState, () => { this.render(); });
                }
                this.model.fetch();
            } else {
                if (this.model.morphState === this.initialRenderOnState) {
                    this.render();
                } else {
                    this.listenTo(this.model, this.initialRenderOnState, () => { this.render(); });
                }
            }

            this.model.listenTo(this.model, 'removeError', (field) => this.removeError(field));
        }
        
        this.on('ready', () => this.render());
    },
    syncError(model, xhr) {
        this.removeSubmitLoading();
        this.showSyncError(model, xhr);
    },
    showSyncError(model, xhr) {
        var json = {};
        if(xhr.responseJSON) {
           json = xhr.responseJSON; 
        } else {
            try {
                json = JSON.parse(xhr.responseText);
            } catch(e) {}
        }
        
        var msg = 'Falha interna ao tentar salvar o registro';
        if(json && (json['errorMessage'] || json['message'])) {
            msg = json['errorMessage'] || json['message'];
        }
        else if('authorization' in json && json.authorization)
            msg = 'Acesso negado';
        
        App = vx.locator.getItem('iApp');
        App.ux.toast.add({msg: msg, color: 'danger text-dark font-weight-bold'});
    },
}));