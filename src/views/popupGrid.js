import _ from "underscore-99xp";
import mnx from "../define";

import template from "../templates/grid.jst";
import grid from "./grid";

import popup from "./popup";
import "jquery-mask-plugin";

export default popup.extend({
    templateBody: template,
    regions: {
        header: ".modal-header",
        body: ".modal-body",
        footer: ".modal-footer",
        filter: ".filter",
        list: ".list",
        pagination: ".pagination",
        legend: ".legend",
    },
    isReady: mnx.utils.isReady,
    provideResults: grid.prototype.provideResults,
    sortResults: grid.prototype.sortResults,
    sortType: grid.prototype.sortType,
    showActions(actions) {
        this.getRegion("footer").currentView.setActions(actions, this);
    },
    initialize() {
        _.bind(popup.prototype.initialize, this)();
        _.bind(grid.prototype.initialize, this)();
    },
    renderBody() {
        $("*", this.getRegion("body").$el).remove();
        this.getRegion("body").$el.append(
            this.templateBody(this.serializeData())
        );

        this.afterRender && this.afterRender();
    },
    getDefaultActions() {
        return [
            {
                ico: "save",
                btnColor: "primary text-light",
                title: "Salvar",
                callback: (e) => this.save(e),
                auth: "{{moduleName}}/form",
            },
        ];
    },
});
