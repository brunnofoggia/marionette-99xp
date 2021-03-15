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
                this.collection.setSort(this.options.sort);

                this.options.results = () => this.provideResults();
                !("filters" in this.options) && (this.options.filters = {});

                !("pagination" in this.options) &&
                    (this.options.pagination = {});
                _.map(this.options.pagination, (v, x) => {
                    this.collection.pagination[x] = v;
                });

                this.options.pagination.collection = this.options.filters.collection = this.collection;
                this.collection.filterOnServer = !!this.options.filterOnServer;
                this.collection.limitOnServer = this.options.limitOnServer || 0;

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
                        if (this.collection.filterOnServer) {
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
                            this.collection.changeSort(col);

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
                    return this.collection.fetch({ reset: true });
                }
                fnCollectionReady();
            },
            provideResults() {
                var filtered = this.collection.filterResults(),
                    sorted = this.collection.sortResults(filtered),
                    paginated = this.collection.paginate(sorted);

                return paginated;
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
