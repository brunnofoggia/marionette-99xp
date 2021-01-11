import _ from 'underscore-99xp';
import vx from 'backbone-front-99xp';
import Mn from 'backbone.marionette';
import utils from './utils';

export default Mn.Application.extend(_.extend({
    navigate(u, o={}) {
        o = _.defaults(o, {trigger: true});
        vx.router.navigate(u, o);
    }
},_.clone(utils.viewLoading), _.clone(utils.viewScroll)));