import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import mnx from "../define";
import form from "./form";

import template from "marionette-99xp/src/templates/filter.jst";
var model = vx.models.filter;

export default form.extend({
    ejs: false,
    template: template,
    events: {
        "click button.search": "search",
        "click button.clear": "clear",
        "click button.config": "config",
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
        this.removeWrapper();
        $('[data-toggle="tooltip"]', this.$el).tooltip();
        $("[data-mask]", this.$el).each((x, el) => {
            $(el).attr("data-mask") in this.masks
                ? this.masks[$(el).attr("data-mask")]($(el))
                : $(el).mask($(el).attr("data-mask"));
        });
        this.setFiltersSizeClass();
    },
    setFiltersSizeClass() {
        this.$el
            .parent()
            .addClass(
                "filter-lines-" +
                    Math.ceil(this.model.displayedCols().length / 3)
            );
    },
    search(e) {
        e && vx.events.stopAll(e);
        this.trigger("search");
    },
    clear(e) {
        e && vx.events.stopAll(e);
        this.model.attributes = _.clone(this.model.defaults);
        this.render().search();
    },
    config(e) {
        e && vx.events.stopAll(e);
        var listView = this.parent.getRegion("list").currentView,
            isDisplayed = (col) => listView.isDisplayed(col),
            cols = listView.availableCols(),
            body = `<select id="modal-confirm-message" class="form-control" multiple="multiple" size="${cols.length}" style="overflow: auto;">{o}</select>`,
            options = [];

        _.each(cols, (col) =>
            options.push(
                `<option value="${col.name}" ${
                    isDisplayed(col) ? 'selected="selected"' : ""
                }>${col.title}</option>`
            )
        );
        body = body.replace("{o}", options.join(""));

        vx.ux.popup.confirmMessage({
            title: "Marque quais colunas devem ser exibidas",
            body,
            confirm: "Salvar",
            dataCancel: "Cancelar",
            confirmClass: "btn-primary text-color-light",
            cancelClass: "btn-danger text-color-light",
            confirmValidation: "Preenchimento obrigatório",
            callback: (val, status, config) => {
                if (!status) return;
                listView.setDisplay(val);
                listView.render();
            },
        });
    },
});
