import _ from 'underscore-99xp';
import vx from 'backbone-front-99xp';
import sync from './sync';

var App;

export default sync.extend({
    regions: {
        infos: '.infos'
    },
    infos: {
        info: [],
        warning: [],
        danger: [],
    },
    gobackUrl: '../lista',
    _saveEvents: false,
    events: {
        'change input': 'setValue',
        'change select': 'setValue',
        'change textarea': 'setValue',
        'change .as-field': 'setValue',
        'submit form': 'save',
        'click .cancel': 'cancel',
        'submit': 'save',
        'click label.auto-for:not([for])': 'setLabelFocus',
        'focus input,select,textarea': 'setFocusBehavior',
        'blur input,select,textarea': 'setBlurBehavior',
    },
    initialize() {
        this.events = _.extend(_.clone(sync.prototype.events), this.events);
        _.bind(sync.prototype.initialize, this)();
    },
    renderListener() {
        if(this.model) {
            this.model.errorsMap = {};
            if (this.options.id) {
                if (this.model.morphState === this.renderOnState)
                    this.render();
                else {
    //                this.listenToOnce(this.model, this.renderOnState, () => { this.render(); });
                    this.listenTo(this.model, this.renderOnState, () => { this.render(); });
                }
                this.model.fetch();
            } else {
                if (this.model.morphState === this.initialRenderOnState) {
                    this.render();
                } else {
                    this.listenToOnce(this.model, this.initialRenderOnState, () => { this.render(); });
                }
            }

            this.model.listenTo(this.model, 'removeError', (field) => this.removeError(field));
        }
        
        this.on('ready', () => this.render());
    },
    applyBehaviors($el) {
        this.showRequired($el);
        sync.prototype.applyBehaviors.apply(this, arguments);
    },
    getElValue($el) {
        return $el.is('select') ? ($('option:selected', $el)).val() :
                ($el.is('input:checkbox') || $el.is('input:radio') ? ($el.is(':checked') ? $el.val() : (typeof $el.attr('value0') !== 'undefined' ? $el.attr('value0') : '')) :
                        ($el.is('.as-field') ? $el.attr('data-field-value') : $el.val()));
    },
    setValue(e) {
        var el = e.target || e.currentTarget, $el = $(el), data = {},
            field = $el.is('.as-field') ? $el.attr('data-field-name') : $el.attr('name');
        
        if(!field) return;

        data[field] = this.getElValue($el);
        
        var set = this.model.set(data, {validate: !/^__/.test(field) ? true : false});
        this.showRequired(this.$el);
        if (!set) {
            this.model.errorsMap[field] = true;
            this.showErrors(this.model.validationError, this.model);
            return false;
        } else {
            this.removeError(field);
        }
    },
    showRequired($form) {
        var v = this.model.getMandatoryValidations(this.model.attributes);
        
        // if(_.size(v) > 0) {
            var reqFields = _.size(v)>0 ? _.map(_.keys(v), (i)=>this.getFieldErrorName(i)) : [];
            $('input[name], select[name], textarea[name], .as-field[data-field-name]', $form).each((x, el) => {
                var $el = $(el), $p = $el.parents('.form-field:first,.form-group:first').eq(0), $label = $('label:first', $p),
                    name = $el.is('.as-field') ? $el.attr('data-field-name') : $el.attr('name'),
                    reqNameTest = [this.getFieldErrorName(name), this.getFieldErrorName(name.replace(/\[\d+\]/g, '[]'))];

                $el.val() && this.setLabelFilled($el);
                if(_.intersection(reqFields, reqNameTest).length>0) { $label.addClass('required'); $el.attr('is-field-required', '1'); }
                else { $label.removeClass('required'); $el.attr('is-field-required', '0'); }
            });
        // }
    },
    getFieldErrorName(fieldName) {
        return fieldName.replace(/\[|\]/g, '-').replace(/\-+/g, '-')+'x';
    },
    showErrors(errors) {
        if (!errors)
            return false;
        
        var fieldErrorLength = {};

        for (let error of errors) {
            var fieldName = error[0];
            // index of list
            if(error[2]) {
                fieldName = fieldName.replace(/\[\]/, '['+error[2]+']');
            }
            !(fieldName in fieldErrorLength) && (fieldErrorLength[fieldName] = 0);
            fieldErrorLength[fieldName]++;
            if(fieldErrorLength[fieldName]>1) continue;

            var fieldErrorName = this.getFieldErrorName(fieldName);

            var field = $('[name="' + fieldName + '"],.as-field[data-field-name="' + fieldName + '"]');
            
            if(field.length) {
                if(this.isThereAnExistingError(fieldErrorName)) {
                    continue;
                }
                this.clearError(fieldErrorName);
                field
                    .attr('data-toggle', 'popover').attr('data-container', 'form#' + this.cid)
                    .attr('data-placement', 'bottom').attr('data-html', true)
                    .attr('data-content', '<span class="form-error-' + fieldErrorName + '">' + error[1] + '</span>')
                    .attr('data-trigger', 'manual').popover('show');
    //            $('.form-error-'+error[0]).parents('.popover:first').addClass('danger');
                $('[class*="form-error-' + fieldErrorName + '"]').parents('.popover:first').addClass('danger');
            } else {
                App = vx.locator.getItem('iApp');
                App.ux.toast.add({msg: error[1] + ' ('+fieldName+')', color: 'danger text-dark font-weight-bold'});
            }
        }

        this.validateOnSet = true;
        return false;
    },
    removeError(field) {
        delete this.model.errorsMap[field];
        this.clearError(field);
    },
    isThereAnExistingError(fieldErrorName) {
        return $('[class*="form-error-' + fieldErrorName + '"]').length > 0;
    },
    clearError(field) {
        $('[name="' + field + '"],.as-field[data-field-name="' + field + '"]').length > 0 && 
                ($('[name="' + field + '"],.as-field[data-field-name="' + field + '"]').popover('dispose'));
    },
//    showInfos() {
//        this.showChildView('infos', new formInfosView({infos: this.infos}));
//    },
    setLabelFocus(e) {
        var el = e.currentTarget, $el = $(el), $container = $el.parents('.field-root:first'), $field;
        if(!$container) { return; }
        $field = $(':input:first', $container);

        if($field) {
            $field.focus();
        }
    },
    setLabelsFilled($form) {
        $('input[name], select[name], textarea[name], .as-field[data-field-name]', $form).each((x, el) => {
            var $el = $(el);
            $el.val() && this.setLabelFilled($el);
        });
    },
    eSetLabelFilled(e) {
        var el = e.currentTarget, $el = $(el);
        if(this.getElValue($el)) {
            this.setLabelFilled($el);
        }
    },
    setLabelFilled($el) {
        var $container = $el.parents('.field-root:first'), $label;
        if(!$container) { return; }
        $label = $('label:first', $container);

        $label && $label.addClass('label-filled');
    },
    setFocusBehavior(e) {
        var el = e.currentTarget, $el = $(el), $container = $el.parents('.field-root:first'), $label;
        if(!$container) { return; }
        $label = $('label:first', $container);

        $container.addClass('focused');
        $label && $label.addClass('label-focused');
    },
    setBlurBehavior(e) {
        var el = e.currentTarget, $el = $(el), $container = $el.parents('.field-root:first'), $label;
        if(!$container) { return; }
        $label = $('label:first', $container);

        $container.removeClass('focused');
        $label && $label.removeClass('label-focused');
    },
    beforeSave() {
        this.addSubmitLoading();
    },
    saveValidation() {
        var validate = this.model.validate(this.model.attributes, {validateAll: true});
        if (_.size(this.model.errorsMap) > 0 || validate) {
            this.showErrors(validate, this.model);
            return false;
        }
        return true;
    },
    save(e) {
        e && vx.events.stopAll(e);
        if(!this.saveValidation()) {
            return;
        }
        
        this.beforeSave && this.beforeSave(e);
//        vx.debug.log('save called');
        
        this.listenToOnce(
            [this.model, 'sync', ()=>this.afterSave()],
            [this.model, 'error', (model, xhr)=>this.syncError(model, xhr)]
        );

        this.model.save();
        this.trigger('saved');
    },
    afterSave() {
        this.removeSubmitLoading();
//        vx.debug.log('is prod ? '+ISPROD);
        this.goback(true);
    },
    cancel(e) {
        this.goback();
    },
    goback(saved) {
        App = vx.locator.getItem('iApp');
        saved && App.ux.toast.add({msg: 'Registro #'+this.model.id+' salvo com sucesso', color: 'info text-dark'});
        
        if('gobackUrl' in this) {
            var url = this.gobackUrl;
            
            if(/\.\.\//.test(url)) {
                var baseUrl = window.location.pathname.replace(/\/s\/.*/, '/s').split('/');
                baseUrl.push(url.replace('../', ''));
                url = baseUrl.join('/');
            }
        }
        
        !('gobackUrl' in this) ? Backbone.history.history.back() : vx.router.navigate(url, {trigger: true});
    },
    getDefaultActions() {
        return [
            {ico: 'save', btnColor: 'primary', btnCss: 'text-light', title: 'Salvar', callback: (e) => this.save(e), auth: "{{moduleName}}/{{typeof id !== 'undefined' && id ? 'update' : 'create'}}"},
            {ico: 'arrow-left', title: 'Cancelar', callback: (e) => this.cancel(e)},
        ];
    },
    /* popups */
    openPopup(e, opts, form, collection, closeFn) {
        var $el = $(e.currentTarget);
        this.popup = new form(opts || {}); // {el: $('.modal-body',modal)[0]}
        this.listenTo(this.popup, 'saved', () => collection.fetch({reset: true}));
        this.listenTo(this.popup, 'close', closeFn);
    },
    closePopup() {
        this.popup = null;
    },
    editPopup(e, $el, form, collection, closeFn) {
        var id = $('option:selected', $el).val();
        if(!id) { return Sk.popup.simple.info({title: 'Problema encontrado', body: 'Selecione o item que deseja alterar'}); }
        var selectedModel = collection.find((model) => model.id == id);
        
//        vx.debug.log(id);
        
//        return this.opensetor(e, {model: selectedModel});
        return this.openPopup(e, {id: id}, form, collection, closeFn);
    },
    updatePopupSelect($el, collection, attr) {
        $('option',$el).remove();
        $('<option>-</option>').appendTo($el);
        collection.each((model)=>{
            var opt = $('<option></option>').val(model.get('id')).html(model.getTitle()).appendTo($el);
        });
        this.model.get(attr) && ($('option[value="'+this.model.get(attr)+'"]', $el).prop('selected', true));
    },
    rmvPopupItem($el, collection) {
        var id = $('option:selected', $el).val();
        if(!id) { return Sk.popup.simple.info({title: 'Problema encontrado', body: 'Selecione o item que deseja excluir'}); }
        
        var selectedModel = collection.find((model) => model.id == id);

        Sk.popup.simple.confirm({
            title: 'Confirmação de Exclusão',
            msg: 'Você confirma a exclusão do item "' + selectedModel.getTitle() + '" ?',
            confirm: 'Confirmar',
            dataCancel: 'Cancelar',
            callback: (status) => {
                if (status) {
                    this.listenToOnce(selectedModel, 'sync', () => collection.fetch({reset: true}));
                    selectedModel.destroy();
                }
            }
        });
    }
});