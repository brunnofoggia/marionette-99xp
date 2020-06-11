import _ from 'underscore-99xp';
import front from 'front-99xp';

var obj = {model: {}, collection: {}, view: {}, app: {}, model_prototype: {}, collection_prototype: {}, view_prototype: {}, app_prototype: {}};

/* allows to create components applying their behaviors on any new instance */
obj.view_prototype.preinitialize = function () {
    if (this.pretriggers.length > 0)
        for (let trigger of this.pretriggers) {
            _.bind(trigger, this)();
        }
}

export default obj;
