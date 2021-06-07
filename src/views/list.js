import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import mnx from "../define";

import template from "marionette-99xp/src/templates/list.jst";

export default mnx.view.extend({
    ejs: false,
    template: template,
    events: {
        "click .item": "selectRow",
        "click .orderby": "orderby",
    },
    initialRenderOnState: "ready",
    renderOnState: "ready",
    render: mnx.view.prototype.renderSync,
    preinitialize(opts) {
        "ev" in opts &&
            (this.events = _.extend(_.clone(this.__proto__.events), opts.ev));
    },
    onRender() {},
    selectRow(e) {
        $("tr", this.$el).removeClass("bg-primary").removeClass("text-light");
        if (!$(e.currentTarget).is(".selected")) {
            $(e.currentTarget)
                .addClass("bg-primary")
                .addClass("text-light")
                .addClass("selected");
        } else {
            $("tr", this.$el).removeClass("selected");
        }
    },
    getSelectedRow(attr = "id") {
        var selected = $("tr.selected", this.$el);
        if (selected.length > 0)
            return attr ? selected.attr("data-" + attr) : selected;
        return false;
    },
    orderby(e) {
        e && vx.events.stopAll(e);

        var $el = $(e.currentTarget),
            $th = $el.parents("th:first");

        this.trigger("orderby", $th.attr("data-name"));
    },
    isAvailable(col) {
        return !("available" in col) || col.available;
    },
    isDisplayed(col) {
        return this.isAvailable(col) && (!("display" in col) || col.display);
    },
    setDisplay(show) {
        if (!_.isArray(show) || !show.length) return;
        _.each(this.options.cols, (col, x) => {
            this.options.cols[x].display = _.indexOf(show, col.name) >= 0;
        });
    },
    availableCols() {
        return _.filter(this.options.cols, (col) => {
            return this.isAvailable(col);
        });
    },
});
