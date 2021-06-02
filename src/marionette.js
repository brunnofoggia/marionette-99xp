import mnx from "./define";
import app from "./views/app";
import grid from "./views/grid";
import form from "./views/form";
import actionBar from "./views/actionBar";
import popup from "./views/popup";
import popupForm from "./views/popupForm";
import popupGrid from "./views/popupGrid";
import sync from "./views/sync";

mnx.views = {};
mnx.views.app = app;
mnx.views.grid = grid;
mnx.views.form = form;
mnx.views.actionBar = actionBar;
mnx.views.popup = popup;
mnx.views.popupForm = popupForm;
mnx.views.popupGrid = popupGrid;
mnx.views.sync = sync;

export default mnx;
