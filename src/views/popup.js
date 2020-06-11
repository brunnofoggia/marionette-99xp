import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../mnx';

import formView from './form';
import actionBarView from './actionBar';

var _ = vx._;


export default formView.extend({
    template: false,
    el: function() { return this.setModal() },
    popupSize: 'unset',
    regions: {
        'header': '.modal-header',
        'body': '.modal-body',
        'footer': '.modal-footer',
    },
    events: {
        'submit form': 'save'
    },
    initialize(opts) {
        if(this.options['id']) {
            if(this.model.morphState === this.renderOnState) this.renderBody();
            else {  
                this.listenToOnce(this.model, this.renderOnState, ()=>this.renderBody());
                this.model.fetch();
            }
        }
        
        
        this.renderBody();
        this.showChildView('footer', new actionBarView());
        
        this.setActions();
        
        return this;
    },
    setModal() {
        if(!this.modal) {
            this.modal = Sk.popup.simple.info({title: this.title || ' ', body: '<div></div>'});
            (!('popupSize' in this) || this.popupSize !== false) && 
                    $('.modal-dialog', this.modal).css('max-width', typeof this.popupSize !== 'function' ? this.popupSize : this.popupSize());
            $('.modal-footer', this.modal).html('');
        }
        
        return this.modal[0];
    },
    cancel(e) {
        this.goback();
    },
    goback(saved) {
        saved && this.trigger('saved');
        this.trigger('close');
        
        Sk.popup.close(this.modal);
    },
    getDefaultActions() {
        return [];
    },
    getCustomActions() { return []; },
    setActions() {
        var alias = this.alias, actions = this.getActions();
        
        var actionData = this;
        for(let x in actions) {
            'navigate' in actions[x] && (actions[x]['navigate'] = _.template(actions[x]['navigate'])(actionData));
            'route' in actions[x] && (actions[x]['route'] = _.template(actions[x]['route'])(actionData));
        }
        
        this.showActions(actions);
    },
    getActions() {
        return _.union(this.getDefaultActions(), this.getCustomActions());
    },
});