import _ from "underscore-99xp";
import vx from "backbone-front-99xp";

import form from "./form";
import actionBar from "./actionBar";

export default form.extend({
    template: false,
    el: function () {
        return this.setModal();
    },
    popupSize: "unset",
    regions: {
        header: ".modal-header",
        body: ".modal-body",
        footer: ".modal-footer",
    },
    events: {
        "submit form": "save",
    },
    initialize(opts) {
        if (this.options["id"]) {
            if (this.model.morphState === this.renderOnState) this.renderBody();
            else {
                this.listenToOnce(this.model, this.renderOnState, () =>
                    this.renderBody()
                );
                this.model.fetch();
            }
        }

        this.renderBody();
        this.showChildView("footer", new actionBar());

        this.setActions();

        return this;
    },
    setModal() {
        if (!this.modal) {
            this.modal = vx.app().ux.popup.info({
                title: this.title || " ",
                body: "<div></div>",
            });
            (!("popupSize" in this) || this.popupSize !== false) &&
                $(".modal-dialog", this.modal).css(
                    "max-width",
                    typeof this.popupSize !== "function"
                        ? this.popupSize
                        : this.popupSize()
                );
            $(".modal-footer", this.modal).html("");
        }

        return this.modal[0];
    },
    cancel(e) {
        this.goback();
    },
    goback(saved) {
        saved && this.trigger("saved");
        this.trigger("close");

        vx.app().ux.popup.close(this.modal);
    },
    getDefaultActions() {
        return [];
    },
    getCustomActions() {
        return [];
    },
    setActions() {
        var alias = this.alias,
            actions = this.getActions();

        var actionData = this;
        for (let x in actions) {
            "navigate" in actions[x] &&
                (actions[x]["navigate"] = _.template(actions[x]["navigate"])(
                    actionData
                ));
            "route" in actions[x] &&
                (actions[x]["route"] = _.template(actions[x]["route"])(
                    actionData
                ));
        }

        this.showActions(actions);
    },
    getActions() {
        return _.union(this.getDefaultActions(), this.getCustomActions());
    },
});
