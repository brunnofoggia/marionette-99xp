import _ from 'underscore-99xp';
import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../mnx';

import template from 'marionette-99xp/src/templates/list.jst';


export default mnx.view.extend({
    template: template,
    events: {
        'click .item': 'selectRow',
        'click .orderby': 'orderby'
    },
    isReady: mnx.utils.isReady,
    initialRenderOnState: 'ready',
    renderOnState: 'ready',
    render: mnx.view.prototype.renderSync,
    preinitialize(opts) {
        ('ev' in opts) && (this.events = _.extend(_.clone(this.__proto__.events), opts.ev));
    },
    onRender() {
    },
    selectRow(e) {
        $('tr', this.$el).removeClass('bg-primary').removeClass('text-light');
        if(!$(e.currentTarget).is('.selected')) {
            $(e.currentTarget).addClass('bg-primary').addClass('text-light').addClass('selected');
        } else {
            $('tr', this.$el).removeClass('selected');
        }
    },
    getSelectedRow() {
        var selected = $('tr.selected', this.$el);
        if(selected.length > 0)
            return selected.attr('data-id');
        return false;
    },
    orderby(e) {
        e && Sk.stopAllEvents(e);
        
        var $el = $(e.currentTarget), $th = $el.parents('th:first');
        
        this.trigger('orderby', $th.attr('data-name'));
    }
});