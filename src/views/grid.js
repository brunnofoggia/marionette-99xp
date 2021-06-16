import vx from "backbone-front-99xp";
import _ from "underscore-99xp";

import mnx from "../define";

import autoUtilEvents from "./autoUtilEvents";
import template from "marionette-99xp/src/templates/grid.jst";
import legendTemplate from "marionette-99xp/src/templates/legend.jst";
import exportTemplate from "marionette-99xp/src/templates/grid_export.jst";
import FilterView from "./filter";
import listView from "./list";
import PaginationView from "./pagination";
import authUnit from "./authUnit";

export default mnx.view.extend(
    _.extend(
        _.clone(mnx.utils.viewActions),
        _.clone(mnx.utils.viewLoading),
        _.clone(autoUtilEvents),
        {
            ejs: false,
            template: template,
            exportTemplate,
            regions: {
                filter: ".filter",
                list: ".list",
                pagination: ".pagination",
                legend: ".legend",
            },
            events: {
                "click .export-csv": "exportCSV",
            },
            onRender() {
                this.removeWrapper();
            },
            removeWrapper() {
                _.bind(mnx.utils.removeWrapper, this)();
            },
            afterRender() {
                this.setActions();
                this.showBreadcrumb();
                this.customize();
            },
            initialize() {
                this.initializeSetEvents();
                this.setGrid();
                vx.debug.globalify("currentView", this);
                vx.debug.globalify("currentCollection", this.collection);
                this.initializePrepareOptions();

                var filterView = this.initializeInstantiateFilter();
                var legendView = this.initializeInstantiateLegend();
                var paginationView = this.initializeInstantiatePagination();

                this.initializeListeners();

                "addAuthAccessRelated" in this && this.addAuthAccessRelated();
                this.initializeFetchAndStart();
            },
            initializeSetEvents() {
                this.events = _.extend(
                    _.clone(autoUtilEvents.events),
                    this.events
                );
            },
            initializePrepareOptions() {
                this.options.get = () => this.options;
                this.options.sort = this.collection.setSort(this.options.sort);

                this.options.results = () => this.collection.listResults();
                !("filters" in this.options) && (this.options.filters = {});

                !("pagination" in this.options) &&
                    (this.options.pagination = {});
                _.map(this.options.pagination, (v, x) => {
                    this.collection.pagination[x] = v;
                });

                this.options.pagination.collection =
                    this.options.filters.collection = this.collection;
                this.collection.cols = this.options.cols;
                this.collection.filterOnServer =
                    this.options.filterOnServer || false;
                this.collection.limitOnServer = this.options.limitOnServer || 0;
            },
            initializeInstantiateFilter() {
                var view = new FilterView(this.options.filters);
                view.parent = this;
                this.showChildView("filter", view);
                this.showChildView("list", new listView(this.options));

                this.collection.filter =
                    this.getRegion("filter").currentView.model;

                return view;
            },
            initializeInstantiateLegend() {
                if (!("legend" in this.options)) return;

                var view = new (mnx.view.extend({
                    template: this.options.legend.template || legendTemplate,
                }))(this.options.legend);

                "legend" in this.options && this.showChildView("legend", view);

                return view;
            },
            initializeInstantiatePagination() {
                var view = new PaginationView(this.options.pagination);
                this.showChildView("pagination", view);

                return view;
            },
            initializeCollectionListeners() {
                var fnCollectionReady = () => {
                        this.getRegion("filter").currentView &&
                            this.getRegion("filter").currentView.render();
                        this.getRegion("list").currentView &&
                            this.getRegion("list").currentView.render();
                        this.getRegion("pagination").currentView &&
                            this.getRegion("pagination").currentView.render();

                        this.removeSubmitLoading();
                        this.afterRender && this.afterRender();
                    },
                    fnCollectionError = (c, xhr, o) => {
                        vx.showAjaxError(xhr);
                        fnCollectionReady();
                    };
                this.listenTo(this.collection, "ready", fnCollectionReady);
                this.listenTo(this.collection, "error", fnCollectionError);
            },
            initializeSearchListener() {
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
            },
            initializePaginationListener() {
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
            },
            initializeSortListener() {
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
            },
            initializeListeners() {
                this.initializeCollectionListeners();
                this.initializeSearchListener();
                this.initializePaginationListener();
                this.initializeSortListener();
            },
            initializeFetchAndStart() {
                this.fetchRelatedLists();
                if (this.collection.isReady() !== true) {
                    return this.collection.fetch({ reset: true });
                }
                fnCollectionReady();
            },
            remove() {
                var selectedRow =
                    this.getRegion("list").currentView.getSelectedRow("cid");
                if (!selectedRow) {
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
                            this.addLoading("Excluindo registro", "remove");
                            this.listenToOnce(
                                [
                                    selectedModel,
                                    "sync",
                                    () => {
                                        this.removeLoading("remove");
                                        this.collection.fetch({ reset: true });
                                        vx.app().ux.toast.add({
                                            msg: `Registro #${id} removido`,
                                            color: "danger text-color-light",
                                        });
                                    },
                                ],
                                [
                                    selectedModel,
                                    "error",
                                    (model, jqXHR, textStatus, errorThrown) => {
                                        this.removeLoading("remove");
                                        vx.app().ux.showInfo({
                                            msg: jqXHR.responseJSON.message,
                                            color: "danger font-weight-bold text-light",
                                        });
                                    },
                                ]
                            );
                            selectedModel.destroy();
                        }
                    },
                });
            },
            edit(e) {
                var selectedRow =
                    this.getRegion("list").currentView.getSelectedRow("cid");
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
            createUrl: "/{{moduleDir || ''}}{{modulePath}}/s/form",
            updateUrl: "/{{moduleDir || ''}}{{modulePath}}/s/form/pk",
            getDefaultActions() {
                return [
                    {
                        ico: "search",
                        title: "Pesquisar",
                        callback: (e) =>
                            $(".filter", this.$el).toggleClass("search-on"),
                    },
                    {
                        ico: "plus",
                        title: "Cadastrar",
                        navigate: this.createUrl,
                        auth: "{{modulePath}}/create",
                    },
                    {
                        ico: "pencil-alt",
                        title: "Alterar",
                        route: this.updateUrl,
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
            exportCSV() {
                var data = this.collection.exportResults(),
                    html = this.exportTemplate({
                        options: {
                            data,
                            cols: this.options.cols,
                        },
                        _,
                        App: vx.app(),
                    });

                vx.utils.openBlob([html], "text/csv", "export.csv");
            },
            customize() {},
        }
    )
);
