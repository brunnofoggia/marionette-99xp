import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import sync from "./sync";

export default sync.extend({
    el: ".body",
    wrapperRemoved: true, // for sync view to work as appview
    isTrullyVisible: false, // used to run events after app is visible on screen
    regions: {
        content: ".content",
    },
    initialize(o) {},
    // dealing with external old plugins
    loadOldAssets(old_assets, callback) {
        var assets = [];
        var old_assets_html =
                typeof old_assets === "function"
                    ? old_assets()
                    : old_assets || "",
            $container;
        //

        if (typeof old_assets !== "undefined" && old_assets) {
            $container = $("<div>").append(old_assets_html);

            $("script", $container).each((x, el) => {
                var $el = $(el);
                var $script = $("<script>");
                $script.attr("data-loaded", "0");
                $("body").append($script); // You should also append the script to the DOM before attaching the onload event:
                $script[0].onload = function () {
                    $(this).attr("data-loaded", "1");
                };
                $script[0].src = $el.attr("src"); // You should set the src attribute after the onload event
                assets.push($script);
            });
        }

        this.oldAssetsAreLoaded(assets, callback);
    },
    oldAssetsAreLoaded(assets, callback) {
        this.oldAssetsLoaded = false;
        this.assetInterval = setInterval(
            _.partial(
                (assets, callback) => {
                    if (this.checkOldAssetsStatus(assets)) {
                        clearInterval(this.assetInterval);
                        this.oldAssetsLoaded = true;
                        typeof callback === "function" && callback();
                    }
                },
                assets,
                callback
            ),
            200
        );
    },
    checkOldAssetsStatus(assets) {
        if (_.size(assets)) {
            for (let asset of assets) {
                let $asset = $(asset);
                if (!$asset.is("script") && !$asset.is("link")) continue;

                if ($asset.is("script")) {
                    if ($asset.attr("data-loaded") != "1") return false;
                } else if ($asset.is("link")) {
                    if (
                        typeof asset === "object" &&
                        "sheet" in asset &&
                        !this.isCSSLinkLoaded(asset)
                    )
                        return false;
                }
            }
        }

        return true;
    },
    afterLoadOldAssets(callback) {
        vx.utils.when(
            () => "oldAssetsLoaded" in this && this.oldAssetsLoaded,
            () => {
                callback();
            }
        );
    },
    isCSSLinkLoaded(link) {
        return Boolean(link.sheet);
    },
    start() {
        vx.debug.log("appview start called");
        this.listenTo(vx.app(), "appready", () => {
            this.afterAppReadyRender();
        });
        vx.app().execute();
    },
    afterAppReadyRender() {
        if (!this.options.old_assets) {
            vx.debug.log("skipping old assets");
            return this.setReady();
        }
        vx.debug.log("loading old assets");
        return this.loadOldAssets(this.options.old_assets, () =>
            this.setReady()
        );
    },
    amIVisible() {
        return $("*:last", this.$el).is(":visible");
    },
    afterVisible() {
        this.isTrullyVisible = true;
        this.afterReady();
    },
    setReady() {
        vx.debug.log("loaded old assets");
        vx.utils.when(
            () => this.amIVisible(),
            () => this.afterVisible()
        );
    },
    afterReady() {},
    setActions(actions, view) {},
    afterNavigate() {
        // remove all toasts after navigating to another page
        vx.app().ux.toast && vx.app().ux.toast.removeAll();
        this.trigger("navigate");
    },
});
