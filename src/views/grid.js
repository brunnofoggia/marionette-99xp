import vx from "backbone-front-99xp";
import _ from "underscore-99xp";

import mnx from "../define";

import autoUtilEvents from "./autoUtilEvents";
import template from "marionette-99xp/src/templates/grid.jst";
import legendTemplate from "marionette-99xp/src/templates/legend.jst";
import filterView from "./filter";
import listView from "./list";
import paginationView from "./pagination";
import authUnit from "./authUnit";

export default mnx.view.extend(
    _.extend(
        _.clone(mnx.utils.viewActions),
        _.clone(mnx.utils.viewLoading),
        _.clone(autoUtilEvents),
        {
            template: template,
            regions: {
                filter: ".filter",
                list: ".list",
                pagination: ".pagination",
                legend: ".legend",
            },
            events: {},
            //    initialRenderOnState: 'ready',
            //    renderOnState: 'ready',
            //    render: mnx.view.prototype.renderSync,
            onRender() {
                _.bind(mnx.utils.removeWrapper, this)();
                vx.utils.when(
                    () => this.isReady() === true,
                    () => this.setActions()
                );
            },
            initialize() {
                this.events = _.extend(
                    _.clone(autoUtilEvents.events),
                    this.events
                );
                this.setGrid();
                vx.debug.globalify("currentView", this);
                vx.debug.globalify("currentCollection", this.collection);

                this.options.get = () => this.options;
                (!("sort" in this.options) ||
                    (typeof this.options.sort !== "object" &&
                        +this.options.sort === 1)) &&
                    (this.options.sort = ["id", "asc"]);

                this.options.results = () => this.provideResults();
                !("filters" in this.options) && (this.options.filters = {});
                this.options.filters.collection = this.collection;
                this.options.filters.filterOnServer = !!this.options
                    .filterOnServer;
                this.showChildView(
                    "filter",
                    new filterView(this.options.filters)
                );
                this.showChildView("list", new listView(this.options));

                "legend" in this.options &&
                    this.showChildView(
                        "legend",
                        new (mnx.view.extend({
                            template:
                                this.options.legend.template || legendTemplate,
                        }))(this.options.legend)
                    );
                this.showChildView(
                    "pagination",
                    new paginationView(this.options.pagination)
                );

                var fnCollectionReady = () => {
                    this.getRegion("filter").currentView &&
                        this.getRegion("filter").currentView.render();
                    this.getRegion("list").currentView &&
                        this.getRegion("list").currentView.render();
                    this.getRegion("pagination").currentView &&
                        this.getRegion("pagination").currentView.render();

                    this.removeSubmitLoading();
                    this.afterRender && this.afterRender();
                };
                this.listenTo(this.collection, "ready", fnCollectionReady);

                // ao pesquisar, executa gofirst que por sua vez demanda o re-render
                this.listenTo(
                    this.getRegion("filter").currentView,
                    "search",
                    () => {
                        if (this.options.filterOnServer) {
                            this.addSubmitLoading("Pesquisando");
                            this.getRegion("pagination").currentView &&
                                this.getRegion(
                                    "pagination"
                                ).currentView.gofirst(true);
                            return this.collection.fetch({ reset: true });
                        }
                        //            this.getRegion('list').currentView && this.getRegion('list').currentView.render();
                        this.getRegion("pagination").currentView &&
                            this.getRegion("pagination").currentView.gofirst();

                        this.afterRender && this.afterRender();
                    }
                );

                this.listenTo(
                    this.getRegion("pagination").currentView,
                    "gopage",
                    () => {
                        this.getRegion("list").currentView &&
                            this.getRegion("list").currentView.render();
                        this.getRegion("pagination").currentView &&
                            this.getRegion("pagination").currentView.render();

                        this.afterRender && this.afterRender();
                    }
                );

                if (this.options.sort !== false) {
                    this.listenTo(
                        this.getRegion("list").currentView,
                        "orderby",
                        (col) => {
                            if (this.options.sort[0] === col) {
                                this.options.sort[1] =
                                    this.options.sort[1] == "asc"
                                        ? "desc"
                                        : "asc";
                            } else {
                                this.options.sort[0] = col;
                                this.options.sort[1] = "asc";
                            }

                            this.getRegion("pagination").currentView &&
                                this.getRegion(
                                    "pagination"
                                ).currentView.render();
                            this.getRegion("list").currentView &&
                                this.getRegion("list").currentView.render();

                            this.afterRender && this.afterRender();
                        }
                    );
                }

                "addAuthAccessRelated" in this && this.addAuthAccessRelated();
                this.fetchRelatedLists();

                this.collection.filter = this.getRegion(
                    "filter"
                ).currentView.model;
                if (this.collection.isReady() !== true) {
                    this.collection.filterOnServer =
                        this.options.filterOnServer || false;
                    this.collection.limitOnServer =
                        this.options.limitOnServer || 0;
                    return this.collection.fetch({ reset: true });
                }
                fnCollectionReady();
            },
            provideResults() {
                return this.getRegion("pagination").currentView
                    ? this.getRegion("pagination").currentView.set(
                          this.sortResults(
                              this.getRegion(
                                  "filter"
                              ).currentView.filterResults(this.collection)
                          )
                      )
                    : this.collection.models;
            },
            sortType: {
                "#int": (col, options, model) =>
                    parseInt(
                        col.orderVal
                            ? col.orderVal(model)
                            : col.val
                            ? col.val(model)
                            : model.get(col.name),
                        10
                    ),
                "#date": (col, options, model) =>
                    parseInt(
                        vx
                            .format(
                                col.orderVal
                                    ? col.orderVal(model)
                                    : col.val
                                    ? col.val(model)
                                    : model.get(col.name),
                                "date",
                                1
                            )
                            .replace(/[^0-9]/g, ""),
                        10
                    ),
                "#list": (col, options, model) =>
                    col.orderVal
                        ? col.orderVal(model)
                        : col.val
                        ? col.val(model)
                        : model.get(col.name),
                "#orderval": (col, options, model) =>
                    col.orderVal
                        ? col.orderVal(model)
                        : col.val
                        ? col.val(model)
                        : model.get(col.name),
            },
            sortResults(r) {
                var colInfo =
                        _.findWhere(this.options.cols, {
                            name: this.options.sort[0],
                        }) || {},
                    i =
                        typeof colInfo.order !== "undefined"
                            ? colInfo.order
                            : "#orderval";

                typeof i === "string" &&
                    i in this.sortType &&
                    (i = { type: i });
                typeof i === "object" &&
                    (i = _.partial(this.sortType[i.type], colInfo, i));

                r = _.sortBy(r, i);
                if (this.options.sort[1] === "desc") r = r.reverse();

                return r;
            },
            remove() {
                var selectedRow = this.getRegion(
                    "list"
                ).currentView.getSelectedRow();
                if (!this.getRegion("list").currentView.getSelectedRow()) {
                    return;
                }
                var selectedModel = this.collection.find(
                    (model) => model.cid == selectedRow
                );
                var id = selectedModel.id;

                vx.app().ux.popup.confirm({
                    title: "Confirmação de Exclusão",
                    msg: "Você confirma a exclusão do registro #" + id + " ?",
                    confirm: "Confirmar",
                    dataCancel: "Cancelar",
                    callback: (status) => {
                        if (status) {
                            this.listenToOnce(selectedModel, "sync", () => {
                                this.collection.fetch({ reset: true });
                                vx.app().ux.toast.add({
                                    msg: `Registro #${id} removido`,
                                    color: "danger text-danger",
                                });
                            });
                            selectedModel.destroy();
                        }
                    },
                });
            },
            edit(e) {
                var selectedRow = this.getRegion(
                    "list"
                ).currentView.getSelectedRow();
                if (!selectedRow) {
                    return;
                }

                var selectedModel = this.collection.find(
                        (model) => model.cid == selectedRow
                    ),
                    route = $(e.currentTarget)
                        .attr("data-route")
                        .replace(/\/pk$/, "/" + selectedModel.id);

                vx.router.navigate(route, { trigger: true });
            },
            getDefaultActions() {
                return [
                    {
                        ico: "plus",
                        title: "Cadastrar",
                        navigate: "/{{modulePath}}/s/form",
                        auth: "{{modulePath}}/create",
                    },
                    {
                        ico: "pencil-alt",
                        title: "Alterar",
                        route: "/{{modulePath}}/s/form/pk",
                        callback: (e) => this.edit(e),
                        auth: "{{modulePath}}/update",
                    },
                    {
                        ico: "times",
                        title: "Excluir",
                        callback: (e) => this.remove(e),
                        auth: "{{modulePath}}/remove",
                    },
                ];
            },
            resetCollection(collection) {
                this.collection = new this.collection.constructor();
                this.initialize();
            },
        }
    )
);
