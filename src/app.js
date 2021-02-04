import _ from "underscore-99xp";
import vx from "backbone-front-99xp";
import Bb from "backbone";
import Mn from "backbone.marionette";
import utils from "./utils";
import seo from "./seo";

export default Mn.Application.extend(
    _.extend(
        {
            router: vx.router,
            navigate(u, o = {}) {
                o = _.defaults(o, { trigger: true });
                vx.router.navigate(u, o);
            },
            startRouter() {
                if (Bb.history && !this.historyStarted) {
                    this.historyStarted = true;
                    this.globalEvents();
                    Bb.history.start({ pushState: true, root: "/" }); // removes # from url
                }
            },
            isMobile() {
                return /Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(
                    navigator.userAgent
                );
            },
            newWebpackBuildDetect(newVersionFn) {
                var script = _.filter(
                    // $('script:not([src$="min.js"])').toArray(),
                    document.getElementsByTagName("script"),
                    (el) => /\/runtime\.([0-9a-zA-Z]+)\.js$/.test(el.src)
                );

                _.each(script, (el) => {
                    var src = el.src + "?_=" + new Date().getTime();
                    $.ajax({ url: src, dataType: "text" }) // datatype will avoid script to be executed
                        .done(function (d, s, r) {
                            if (
                                r
                                    .getResponseHeader("content-type")
                                    .toLowerCase()
                                    .indexOf("application/javascript") === -1
                            ) {
                                return newVersionFn();
                            }
                        })
                        .fail(() => {
                            newVersionFn();
                        });
                });
            },
            globalEvents() {
                this.globalEventClickLink();
                this.globalEventClickAnchor();
            },
            globalEventClickLink() {
                $(document).on("click", 'a[href^="/"]:not([target])', (e) => {
                    e && vx.events.preventDefault(e);
                    if (!this.online) return;
                    var el = e.currentTarget;
                    vx.router.navigate(el.attributes.href.value, {
                        trigger: true,
                    });
                });
            },
            globalEventClickAnchor() {
                $(document).on(
                    "click",
                    'a[href^="#"]:not([data-toggle])',
                    (e) => {
                        if (!this.online) return;
                        var $el = $(e.currentTarget);
                        if ($el.attr("href") === "#") return;

                        e && vx.events.preventDefault(e);
                        var $scroll = $($el.attr("href")),
                            offsetTop = $scroll.offset()["top"],
                            headerHeight = this.headerHeight();
                        $("body, html").animate(
                            {
                                scrollTop: offsetTop - headerHeight,
                            },
                            1000
                        );
                    }
                );
            },
            headerHeight() {
                return $("header").height();
            },
        },
        _.clone(utils.viewLoading),
        _.clone(utils.viewScroll),
        _.clone(seo)
    )
);
