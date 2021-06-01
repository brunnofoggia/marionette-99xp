import _ from "underscore-99xp";
import mnx from "../define";

import template from "../templates/actionBar.jst";

export default mnx.view.extend({
    template: template,
    setActions(actions, o = {}) {
        this.options.actions = actions;
        this.options.global = o;

        this.undelegateEvents();
        this.events = {};
        for (let x in this.options.actions) {
            if ("callback" in this.options.actions[x]) {
                this.events["click .action-" + x] =
                    this.options.actions[x].callback;
            }

            !this.options.actions[x].addClass &&
                (this.options.actions[x].addClass = "");
            o.addClass &&
                (this.options.actions[x].addClass += " " + o.addClass);
        }
        this.render();
        this.delegateEvents();
        return this;
    },
});
