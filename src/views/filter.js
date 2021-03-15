import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import mnx from "../define";
import form from "./form";

import template from "marionette-99xp/src/templates/filter.jst";
import Masks from "front-99xp/src/masks/igorescobar";

var model = vx.vmodel.extend({
    idAttribute: "_filterId",
    format: {},
    defaults: {},
    sendEmptyFilter: {},
});

export default form.extend({
    template: template,
    events: {
        "click button.search": "search",
        "click button.clear": "clear",
        "submit form": "save",
        submit: "search",
    },
    initialize(o) {
        this.model = new model();
        this.setCols(o.cols);

        this.events = _.extend(_.clone(form.prototype.events), this.events);
        _.bind(form.prototype.initialize, this)();
    },
    setCols(o) {
        if (!o) return;

        _.each(o, (col) => {
            if (col.default && !this.model.get(col.name)) {
                this.model.set(col.name, col.default);
                this.model.defaults[col.name] = col.default;
            }
            if (col.format) {
                this.model.format[col.name] = col.format;
            }
            this.model.sendEmptyFilter[col.name] = col.sendEmpty || false;
        });
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
    filterResults(collection) {
        var r = collection.models;
        if (this.options.filterOnServer) return r;

        if (this.options.cols && this.options.cols.length > 0) {
            for (let col of this.options.cols) {
                let filterValue = this.filterValue(col.name, col),
                    filterValues;
                if (filterValue) {
                    r = _.filter(r, (item) => {
                        var test = false,
                            val =
                                ("val" in col
                                    ? col.val(item)
                                    : item.get(col.name)) + "";

                        if (val) {
                            switch (col.filter || "exact") {
                                case "%":
                                    test =
                                        val
                                            .toLowerCase()
                                            .indexOf(
                                                filterValue.toLowerCase()
                                            ) === 0;
                                    break;
                                default:
                                    filterValues = (filterValue + "").split(
                                        col.splitter || ","
                                    );
                                    test =
                                        _.size(
                                            _.filter(
                                                filterValues,
                                                (filterValue) =>
                                                    val.trim() ===
                                                    filterValue.trim()
                                            )
                                        ) > 0;
                                    break;
                            }
                        }

                        return test;
                    });
                }
            }
        }

        return r;
    },
    filterValue(name, o) {
        var format = o.filterVal || ((f) => f);
        return format(this.model.get(name));
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
