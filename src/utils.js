import _ from 'underscore-99xp';
import front from 'front-99xp';

var obj = {};

obj.removeWrapper = function () {
    if ('wrapperRemoved' in this)
        return this;
    // Get rid of that pesky wrapping-div.
    // Assumes 1 child element present in template.
    this.$el = this.$el.children();
    // Unwrap the element to prevent infinitely 
    // nesting elements during re-render.
    this.$el.unwrap();
    this.setElement(this.$el);
    this.wrapperRemoved = true;
}

obj.isReady = function () {
    if ((!this.model || this.model.isReady()) && (!this.collection || this.collection.isReady()) && (!('isAllRelatedReady' in this) || this.isAllRelatedReady())) {
        return true;
    }
    return false;
};

// actions
obj.viewActions = {
    getDefaultActions() {
        return [];
    },
    getCustomActions() {
        return [];
    },
    getActions() {
        return _.union(this.getDefaultActions(), this.getCustomActions());
    },
    setActions() {
        var actions = this.formatActions(), l = [];
        
        for(let action of actions) {
            l.push(action);
        }
        
        this.showActions(l);
    },
    formatActions() {
        if(!('moduleName' in this)) return []; // view loaded not by routing
        
        var alias = this.alias, actions = this.getActions();

        var actionData = this;
        
        for (let x in actions) {
            'navigate' in actions[x] && (actions[x]['navigate'] = _.template(actions[x]['navigate'])(actionData));
            'route' in actions[x] && (actions[x]['route'] = _.template(actions[x]['route'])(actionData));
            'auth' in actions[x] && (actions[x]['auth'] = _.template(actions[x]['auth'])(actionData));
        }

        return actions;
    },
    formatNavigateUrl(tpl) {
        var actionData = this;
        return _.template(tpl)(actionData);
    },
    showActions(actions=null) {
        var App = front.locator.getItem('iApp');

        typeof App.getView()==='object' && 
                ('setActions' in App.getView()) && 
                App.getView().setActions(actions, this);
    },
};

// loading

obj.viewLoading = Object.freeze({
    _isSubmitting: false,
    _loadingText: ' ',
    isSubmitting() {
        return !!this._isSubmitting;
    },
    addSubmitLoading(text) {
//        if($(':submit', this.$el).length && $(':submit', this.$el).attr('data-loading') && this.isSubmitting()===false) {
//            !$(':submit', this.$el).attr('data-text') && $(':submit', this.$el).attr('data-text', $(':submit', this.$el).html());
        if(this.isSubmitting()===false) {
            this._loadIdSubmitting = uxLoading.add(text || this._loadingText);
            this._isSubmitting = true;
        }
    },
    removeSubmitLoading() {
//        $(':submit', this.$el).length && $(':submit', this.$el).attr('data-loading') && $(':submit', this.$el).html($(':submit', this.$el).attr('data-text'));
        if(this.isSubmitting()===true) {
            uxLoading.remove(this._loadIdSubmitting);
            this._isSubmitting = false;
        }
    },
});


export default obj;
