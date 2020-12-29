import _ from 'underscore-99xp';
import mnx from '../define';

import template from '../templates/actionBar.jst';

export default mnx.view.extend({
    template: template,
    setActions(actions, view) {
        this.options.actions = actions;
        
        this.undelegateEvents();
        this.events = {};
        for(let x in this.options.actions) {
            if('callback' in this.options.actions[x]) {
                this.events['click .action-'+x] = this.options.actions[x].callback;
            }
            
        }
        
        this.render();
        this.delegateEvents();
    }
});