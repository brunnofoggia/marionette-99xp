import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../marionette';

import popupView from './popupView';
import actionBarView from './actionBar';
import 'jquery-mask-plugin';
import Masks from '../../masks/igorescobar';

var _ = vx._;


export default popupView.extend({
    events: {
        'change input': 'setValue',
        'change select': 'setValue',
        'change textarea': 'setValue',
        'submit form': 'save'
    },
    showActions(actions) {
        this.getRegion('footer').currentView.setActions(actions, this);
    },
    initialize() {
        this.validateOnSet = false;
        this.model.errorsMap = {};
        if(this.options['id']) {
            if(this.model.morphState === this.renderOnState) this.renderBody();
            else {
                this.listenToOnce(this.model, this.renderOnState, ()=>this.renderBody());
                this.model.fetch();
            }
        } else {
//             concluir implementacao do initial render. quando nulo renderiza, quando tiver um status checado implementar o listentoonce na model
//            !this.initialRenderOnState || this.model.isReady() ? this.render() : this.listenToOnce(this.model, this.initialRenderOnState, ()=>this.render());
        }
        
        this.model.listenTo(this.model, 'removeError', (field)=>this.removeError(field));
        
        
        this.renderBody();
        this.showChildView('footer', new actionBarView());
        
        this.setActions();
        
        return this;
    },
    renderBody() {
        $('*', this.getRegion('body').$el).remove();
        this.getRegion('body').$el.append(this.templateBody(this.serializeData()));
        
//        _.bind(mnx.utils.removeWrapper, this)();
        this.applyFormBehaviors(this.getRegion('body').$el);
        
        this.afterRender && this.afterRender();
    },
    setValue(e) {
        var el = e.target, $el = $(el), field = $el.attr('name'), data = {};
        
        data[field] = $el.is('select') ? ($('option:selected', $el)).val() : 
                ($el.is('input:checkbox') || $el.is('input:radio') ? ($el.is(':checked') ? $el.val() : (typeof $el.attr('value0') !== 'undefined' ? $el.attr('value0') : '')) : 
                    ($el.val())); //
        
        var set = this.model.set(data, {validate: true});
        if(!set) {
//            vx.debug.log('set error');
//            vx.debug.log(set);
            this.model.errorsMap[field] = true;
            this.showErrors(this.model.validationError, this.model);
            return false;
        } else {
//            vx.debug.log('set non error');
//            vx.debug.log(set);
            this.removeError(field);
        }
        this.infos.danger = [];
    },
    getDefaultActions() {
        return [
            {ico: 'save', btnColor: 'primary text-light', title: 'Salvar', callback: (e)=>this.save(e), auth: '{{moduleName}}/form'}
        ];
    },
    goback(saved) {
        if(saved) {
            var fn = () => {
                saved && this.trigger('saved');
                this.trigger('close');
                Sk.popup.close(this.modal);
            };
            
            fn();
        } else {
            this.trigger('close');
            Sk.popup.close(this.modal);
        }
    }
});