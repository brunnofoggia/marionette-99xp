import _ from 'underscore-99xp';
import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../marionette';

import template from 'marionette-99xp/src/templates/filter.jst';
import Masks from 'front-99xp/src/masks/igorescobar';

export default mnx.view.extend({
    template: template,
    events: {
        'click button.search': 'search',
        'click button.clear': 'clear',
        'submit': 'search',
    },
    masks: Masks,
    isReady: mnx.utils.isReady,
    initialRenderOnState: 'ready',
    renderOnState: 'ready',
    render: mnx.view.prototype.renderSync, // mnx.view.prototype.renderSync
    onRender() {
        _.bind(mnx.utils.removeWrapper, this)();
        $('[data-toggle="tooltip"]', this.$el).tooltip();
        $('[data-mask]', this.$el).each((x, el)=>{
            $(el).attr('data-mask') in this.masks ? this.masks[$(el).attr('data-mask')]($(el)) : $(el).mask($(el).attr('data-mask'));;
        });
    },
    filterResults(collection) {
        var r = collection.models;
        if(this.options.cols && this.options.cols.length>0) {
            for(let col of this.options.cols) {
                let value = this.filterValue(col.name);
                if(value) {
                    r = _.filter(r, (item)=>{
                        var test = false, val = 'val' in col ? col.val(item) : item.get(col.name);
                        if(val)
                        switch(col.filter || 'exact') {
                            case '%':
                                test = val.toLowerCase().indexOf(value.toLowerCase())===0;
                                break;
                            default:
                                test = val.toString() === value;
                                break;
                        }
                        
                        return test;
                    });
                }
            }
            
//            return r;
        }
        
        return r;
    },
    filterValue(name) {
        var field = $('[name="'+name+'"]', this.$el);
        if(field.length > 0) {
            return field.is('input') ? field.val() : ($('option:selected', field)).val();
        }
        return null;
    },
    search(e) {
        e && vx.events.stopAll(e);
        this.trigger('search');
    },
    clear() {
        this.render().search();
    }
});