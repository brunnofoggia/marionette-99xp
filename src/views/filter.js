import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import mnx from "../define";
import form from "./form";

import template from "marionette-99xp/src/templates/filter.jst";
var model = vx.models.filter;

export default form.extend({
    template: template,
    events: {
        "click button.search": "search",
        "click button.clear": "clear",
        "submit form": "save",
        submit: "search",
    },
    initialize(o) {
        this.model = new model({});
        this.setCols(o.cols);

        this.events = _.extend(_.clone(form.prototype.events), this.events);
        _.bind(form.prototype.initialize, this)();
    },
    setCols(o) {
        this.model.setCols(o);
    },
    onRender() {
        _.bind(mnx.utils.removeWrapper, this)();
        $('[data-toggle="tooltip"]', this.$el).tooltip();
        $("[data-mask]", this.$el).each((x, el) => {
            $(el).attr("data-mask") in this.masks
                ? this.masks[$(el).attr("data-mask")]($(el))
                : $(el).mask($(el).attr("data-mask"));
        });
    },
    search(e) {
        e && vx.events.stopAll(e);
        this.trigger("search");
    },
    clear() {
        this.model.attributes = _.clone(this.model.defaults);
        this.render().search();
    },
});
