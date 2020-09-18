import vx from 'front-99xp';

import authAccess from 'backbone-front-99xp/src/collections/authAccess';

var _ = vx._;

var authUnit = {
    addAuthAccessRelated() {
        let al = this.getActionsAccessList();
        let aalist = new authAccess([], al);
        this.addRelatedList(this.getRelatedAuthAccessKey(), aalist);
        this.listenTo(aalist, 'ready', () => {
            this.setActions();
        });
        
        return aalist;
    },
    setActions() {
        var actions = this.formatActions(), l = [];
        
        for(let action of actions) {
            if(this.checkActionAccess(action.auth)) {
                l.push(action);
            }
        }
        
        this.showActions(l);
    },
    getActionsAccessList() {
        var l = [], m = this.formatActions();
        
        for(let menu of m) {
            if('auth' in menu) {
                l.push({path: menu.auth});
            }
        }
        
        return l;
    },
    checkActionAccess(url) {
        return (this.getRelatedAuthAccessKey() in this.relatedLists) && this.relatedLists[this.getRelatedAuthAccessKey()].isReady() &&
            (!(url in this.relatedLists[this.getRelatedAuthAccessKey()].relatedLists) || this.relatedLists[this.getRelatedAuthAccessKey()].relatedLists[url].isAuthorized()===true);
    },
    getRelatedAuthAccessKey() {
//        return 'authAccess';
        return 'authAccess-'+this.cid;
    },
};

export default authUnit;
    