import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import Masks from "front-99xp/src/masks/igorescobar";
import mnx from "../define";
import autoUtilEvents from "./autoUtilEvents";

export default mnx.view.extend(
    _.extend({}, _.clone(mnx.utils.viewActions), _.clone(autoUtilEvents), {
        initialRenderOnState: "ready",
        renderOnState: "ready",
        renderFn: "render",
        render: mnx.view.prototype.renderSync,
        masks: Masks,
        onRender() {
            this.removeWrapper();

            if (!this.isReady() === true) return;
            this.applyBehaviors(this.$el);
            this.afterRender && this.afterRender();
            this._firstRender = false;
        },
        removeWrapper() {
            _.bind(mnx.utils.removeWrapper2, this)();
        },
        applyBehaviors($el) {
            vx.utils.when(
                () => $.fn.tooltip,
                () => $('[data-toggle="tooltip"]', $el).tooltip()
            );
            this.masks.apply($el);
        },
        initialize() {
            vx.debug.globalify("currentView", this);
            vx.debug.globalify("currentModel", this.model);
            this.events = _.extend(_.clone(autoUtilEvents.events), this.events);
            this.validateOnSet = false;

            this.renderListener();

            // event added to render after loading auth access
            "addAuthAccessRelated" in this && this.addAuthAccessRelated();
            if (!this.fetchRelatedLists() && this.isReady() === true) {
                this[this.renderFn]();
            }

            return this;
        },
        renderListener() {
            if (this.model) {
                this.model.errorsMap = {};
                if (this.options.id) {
                    if (this.areReadyModelAndCollection() === true)
                        this[this.renderFn]();
                    else {
                        //                this.listenToOnce(this.model, this.renderOnState, () => { this[this.renderFn](); });
                        this.listenTo(this.model, this.renderOnState, () => {
                            this[this.renderFn]();
                        });
                    }
                    this.model.fetch();
                } else {
                    if (this.areReadyModelAndCollection() === true) {
                        this[this.renderFn]();
                    } else {
                        this.listenTo(this.model, this.renderOnState, () => {
                            this[this.renderFn]();
                        });
                    }
                }

                this.model.listenTo(this.model, "removeError", (field) =>
                    this.removeError(field)
                );
            }

            this.on("ready", () => this[this.renderFn]());
        },
        syncError(model, xhr) {
            this.removeSubmitLoading();
            this.showSyncError(model, xhr);
        },
        getSyncErrorMsg(model, xhr) {
            var json = {};
            if (xhr.responseJSON) {
                json = xhr.responseJSON;
            } else {
                try {
                    json = JSON.parse(xhr.responseText);
                } catch (e) {}
            }

            var msg = "Falha interna ao tentar salvar o registro";
            if (json && (json["errorMessage"] || json["message"])) {
                msg = json["errorMessage"] || json["message"];
            } else if ("authorization" in json && json.authorization)
                msg = "Acesso negado";

            return msg;
        },
        showSyncError(model, xhr) {
            vx.app().ux.toast.add({
                msg: this.getSyncErrorMsg(model, xhr),
                color: "danger text-dark font-weight-bold",
            });
        },
        afterRender() {
            this.setActions();
            this.showBreadcrumb();
            this.customize();
        },
        customize() {},
    })
);
