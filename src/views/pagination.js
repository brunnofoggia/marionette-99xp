import vx from 'front-99xp';
import mnx from '../marionette';

import template from 'marionette-99xp/src/templates/pagination.jst';

var _ = vx._;

export default mnx.view.extend({
    template: template,
    events: {
        'click button.first': 'gofirst',
        'click button.prev': 'goprev',
        'click button.next': 'gonext',
        'click button.last': 'golast',
        'change select.goto': 'goto',
    },
    initialize() {
        this.options.page = 1;
        this.options.pagesData = { first: false, prev: false, next: false, last: false, list: []};
    },
    onRender: mnx.utils.removeWrapper,
    goto(e) {
        this.options.page = parseInt($('option:selected', e.currentTarget).val(), 10);
        this.trigger('gopage');
    },
    gofirst() {
        this.options.page = 1;
        this.trigger('gopage');
    },
    goprev() {
        this.options.page -= 1;
        this.trigger('gopage');
    },
    gonext() {
        this.options.page += 1;
        this.trigger('gopage');
    },
    golast() {
        this.options.page = _.last(this.options.pagesData.list);
        this.trigger('gopage');
    },
    set(results) {
        this.pages(results, this.options.page);
        
        return this.paginate(results, this.options.page);
    },
    pages(results, page) {
        var range = this.getRange(page),
            data = { first: false, prev: false, next: false, last: false, list: []},
            pageCount = 1;
            
        if(range.start > 0) {
            data.first = true;
            data.prev = true;
        }
        
        if(range.stop < (results.length)) {
            data.next = true;
            data.last = true;
        }
        
        do {
            data.list.push(pageCount++);
        } while(this.getRange(pageCount).start < (results.length));
        
        this.options.pagesData = data;
    },
    getRange(page) {
        !this.options.limit && (this.options.limit = 10);
        var data = {};
        data.limit = this.options.limit;
        data.start = (page*data.limit)-data.limit;
        data.stop = (page*data.limit);
        data.list = _.range(data.start, data.stop);
        return data;
    },
    paginate(results, page) {
        if(!this.options.activated) return results;
            
        var paginated = [],
            range = this.getRange(page);
        
        for(var x of range.list) {
            if(!(x in results)) break;
            paginated.push(results[x]);
        }
        
        return paginated;
    }
});