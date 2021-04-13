import _ from "underscore-99xp";
import vx from "backbone-front-99xp";

import sync from "./sync";
import actionBar from "./actionBar";

export default sync.extend({
    template: false,
    el: function () {
        return this.setModal();
    },
    popupSize: "unset",
    renderFn: "renderBody",
    regions: {
        header: ".modal-header",
        body: ".modal-body",
        footer: ".modal-footer",
    },
    initialize(o) {
        this.validateOnSet = false;
        this.model.errorsMap = {};

        this.renderListener();

        this.showChildView("footer", new actionBar());
        this.setActions();

        return this;
    },
    setModal() {
        if (!this.modal) {
            this.modal = vx
                .app()
                .ux.popup.info({
                    title: this.title || " ",
                    body: "<div></div>",
                })
                .removeClass("show")
                .addClass("d-none");
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
    showInheritedTitle() {
        var $title = $("h1, h2", this.$el).eq(0),
            $header = this.getRegion("header").$el,
            $headerTitle = $(".title", $header);
        if (!$headerTitle.length) {
            $headerTitle = $('<span class="title">');
            $header.prepend($headerTitle);
        }
        $headerTitle.html($title.html());
        $title.parents(".row:first").remove();
    },
    renderBody() {
        $("*", this.getRegion("body").$el).remove();
        this.getRegion("body").$el.append(
            this.templateBody(this.serializeData())
        );

        this.applyBehaviors(this.getRegion("body").$el);

        this.afterRender && this.afterRender();
    },
    afterRender() {
        this.showInheritedTitle();
        setTimeout(() => this.showPopup(), 400);
    },
    showPopup() {
        this.modal.removeClass("d-none").addClass("show");
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
        return [
            {
                // ico: "times",
                btnColor: "primary",
                btnCss: "text-light",
                afterText: "Fechar",
                callback: (e) => this.cancel(e),
            },
        ];
    },
    getCustomActions() {
        return [];
    },
    showActions(actions) {
        if (_.size(actions)) {
            this.getRegion("footer").$el.removeClass("d-none");
            this.getRegion("footer").currentView.setActions(actions, this);
            return;
        }
        this.getRegion("footer").$el.addClass("d-none");
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
