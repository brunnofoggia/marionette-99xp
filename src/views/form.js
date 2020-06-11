import _ from 'underscore-99xp';
import vx from 'front-99xp';
import bbx from 'backbone-99xp';
import mnx from '../marionette';

import Masks from 'front-99xp/src/masks/igorescobar';
import authUnit from '../views/authUnit';

var App = vx.locator.getItem('iApp');

export default mnx.view.extend(_.extend(_.clone(mnx.utils.viewActions), {
    regions: {
        infos: '.infos'
    },
    infos: {
        info: [],
        warning: [],
        danger: [],
    },
    initialRenderOnState: 'ready',
    renderOnState: 'ready',
    isReady: mnx.utils.isReady,
    render: mnx.view.prototype.renderSync,
    masks: Masks,
    gobackUrl: '../lista',
    _saveEvents: false,
    events: {
        'change input': 'setValue',
        'change select': 'setValue',
        'change textarea': 'setValue',
        'change .as-field': 'setValue',
        'submit form': 'save',
        'submit': 'save',
    },
    onRender() {
        _.bind(mnx.utils.removeWrapper, this)();
        
        if(!this.isReady()) return;
        this.applyFormBehaviors(this.$el);

        this.isReady() && this.setActions();
        this.isReady() && this.afterRender && this.afterRender();
    },
    applyFormBehaviors($el) {
        this.showRequired($el);
        Sk.waitFor(()=>$.fn.tooltip, ()=>$('[data-toggle="tooltip"]', $el).tooltip());
        this.masks.apply($el);
    },
    initialize() {
        vx.debug.globalify('currentView', this);
        vx.debug.globalify('currentModel', this.model);
        this.validateOnSet = false;
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
        
        // event added to render after loading auth access
        this.on('ready', () => this.render());
        ('addAuthAccessRelated' in this) && this.addAuthAccessRelated();
        if(!this.fetchRelatedLists() && this.isReady()) {
            this.render();
        }
        
        return this;
    },
    setValue(e) {
        var el = e.target, $el = $(el), data = {},
            field = $el.is('.as-field') ? $el.attr('data-field-name') : $el.attr('name');
        
        if(!field) return;

        data[field] = $el.is('select') ? ($('option:selected', $el)).val() :
                ($el.is('input:checkbox') || $el.is('input:radio') ? ($el.is(':checked') ? $el.val() : (typeof $el.attr('value0') !== 'undefined' ? $el.attr('value0') : '')) :
                        ($el.is('.as-field') ? $el.attr('data-field-value') : $el.val())); //

        
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
        var v = this.model.validations(this.model.attributes);
        
        if(_.size(v) > 0) {
            var reqFields = _.map(_.keys(v), (i)=>this.getFieldErrorName(i));
            $('input[name], select[name], textarea[name], .as-field[data-field-name]', $form).each((x, el) => {
                var $el = $(el), $p = $el.parents('.form-field:first,.form-group:first').eq(0), $label = $('label:first', $p),
                    name = $el.is('.as-field') ? $el.attr('data-field-name') : $el.attr('name'),
                    reqNameTest = this.getFieldErrorName(name.replace(/\[\d+\]/g, '[]'));

                if(_.indexOf(reqFields, reqNameTest)!==-1) { $label.addClass('required').addClass('font-weight-bold'); $el.attr('is-field-required', '1'); }
                else { $label.removeClass('required').removeClass('font-weight-bold'); $el.attr('is-field-required', '0'); }
            });
        }
    },
    getFieldErrorName(fieldName) {
        return fieldName.replace(/\[|\]/g, '-').replace(/\-+/g, '-')+'x';
    },
    showErrors(errors) {
        if (!errors)
            return false;
        for (let error of errors) {
            var fieldName = error[0];
            // index of list
            if(error[2]) {
                fieldName = fieldName.replace(/\[\]/, '['+error[2]+']');
            }

            var fieldErrorName = this.getFieldErrorName(fieldName);

            this.clearError(fieldErrorName);
            var field = $('[name="' + fieldName + '"],.as-field[data-field-name="' + fieldName + '"]');
            
            if(field.length) {
                field
                    .attr('data-toggle', 'popover').attr('data-container', 'form#' + this.cid)
                    .attr('data-placement', 'bottom').attr('data-html', true)
                    .attr('data-content', '<span class="form-error-' + fieldErrorName + '">' + error[1] + '</span>')
                    .attr('data-trigger', 'manual').popover('show');
    //            $('.form-error-'+error[0]).parents('.popover:first').addClass('danger');
                $('[class*="form-error-' + fieldErrorName + '"]').parents('.popover:first').addClass('danger');
            } else {
                App.ux.toast({msg: error[1] + ' ('+fieldName+')', color: 'danger text-dark font-weight-bold'});
            }
        }

        this.validateOnSet = true;
        return false;
    },
    removeError(field) {
        delete this.model.errorsMap[field];
        this.clearError(field);
    },
    clearError(field) {
        $('[name="' + field + '"],.as-field[data-field-name="' + field + '"]').length > 0 && 
                ($('[name="' + field + '"],.as-field[data-field-name="' + field + '"]').popover('dispose'));
    },
//    showInfos() {
//        this.showChildView('infos', new formInfosView({infos: this.infos}));
//    },
    beforeSave() {
        this.addSubmitLoading();
    },
    save(e) {
        e && Sk.stopAllEvents(e);
        var validate = this.model.validate(this.model.attributes, {validateAll: true});
        if (_.size(this.model.errorsMap) > 0 || validate) {
            return this.showErrors(validate, this.model);
        }
        
        this.beforeSave && this.beforeSave(e);
//        vx.debug.log('save called');
        
        if(!this._saveEvents) {
            this._saveEvents = true;
            this.model.listenTo(this.model, 'sync', () => this.afterSave());
            this.model.listenTo(this.model, 'error', (model, xhr) => this.syncError(model, xhr));
        }

        this.model.save();
        this.trigger('saved');
    },
    syncError(model, xhr) {
        this.removeSubmitLoading();
        
        var json = {};
        if(xhr.responseJSON) {
           json = xhr.responseJSON; 
        } else {
            try {
                json = JSON.parse(xhr.responseText);
            } catch(e) {}
        }
        
        var msg = 'Falha interna ao tentar salvar o registro';
        if(json && (json['errorMessage'] || json['message'])) {
            msg = json['errorMessage'] || json['message'];
        }
        else if('authorization' in json && json.authorization)
            msg = 'Acesso negado';
        
        App.ux.toast({msg: msg, color: 'danger text-dark font-weight-bold'});
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
        saved && App.ux.toast({msg: 'Registro #'+this.model.id+' salvo com sucesso', color: 'info text-dark'});
        
        if('gobackUrl' in this) {
            var url = this.gobackUrl;
            
            if(/\.\.\//.test(url)) {
                var baseUrl = window.location.pathname.replace(/\/s\/.*/, '/s').split('/');
                baseUrl.push(url.replace('../', ''));
                url = baseUrl.join('/');
            }
        }
        
        !('gobackUrl' in this) ? Backbone.history.history.back() : bbx.router.navigate(url, {trigger: true});
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
    },
}, _.clone(mnx.utils.viewLoading)));