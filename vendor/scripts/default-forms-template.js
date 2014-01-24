/**
 * Include this template file after backbone-forms.amd.js to override the default templates
 *
 * 'data-*' attributes control where elements are placed
 * help: schema.help || '',
 *     title: schema.title,
 *     fieldAttrs: schema.fieldAttrs,
 *     editorAttrs: schema.editorAttrs,
 *     key: this.key,
 *     editorId: this.editor.id
 */
;(function(Form) {


  /**

   */
// if no template is give bbf would go ahead and use fieldsets ... so leaving this for compatibility... as bbf need this !
//            Form.template = _.template('\
//                <form class="form-horizontal" role="form" action="#" method="#" data-fields>\
//                <div class="ui-block-b"><button type="submit" data-theme="a" id="save_offer">Zapisz!</button></div>\
//                </form>\
//            ');

            Form.Fieldset.template = _.template('\
                <fieldset data-fields>\
                <% if (legend) { %>\
                <legend><%= legend %></legend>\
                <% } %>\
                </fieldset>\
            ');



  Form.Field.template = _.template('\
        <div class="ui-field-contain" data-mini="true" data-editor >\
      <label for="<%= editorId %>"><%= title %><% if (help) { %> <a class="form-help ui-btn ui-icon-info ui-btn-icon-notext ui-corner-all"><%= help %></a> <% } %>\
      <br />\
        <span class="help-block" data-error></span>\
      </label>\
        </div>\
  ');
//  Form.BooleanSelect.template = _.template('\
//        <div class="ui-field-contain" data-mini="true" data-editor >\
//      <label for="<%= editorId %>"><%= title %><% if (help) { %> <a href="#" class="ui-btn ui-icon-info ui-btn-icon-notext ui-corner-all"><%= help %></a> <% } %>\
//      <br />\
//        <span class="help-block" data-error></span>\
//      </label>\
//        </div>\
//  ');

  Form.editors.Date.template = _.template('\
        <fieldset data-role="controlgroup" data-type="horizontal" data-editor >\
      <select data-type="date"><%= dates %></select>\
      <select data-type="month"><%= months %></select>\
      <select data-type="year"><%= years %></select>\
        </fieldset>\
        <p class="help-block" data-error></p>\
  ');

 Form.editors.Date.monthNames = [ 'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień' ];





  Form.NestedField.template = _.template('\
    <div class="field-<%= key %>">\
      <div title="<%= title %>" class="input-xlarge">\
        <span data-editor></span>\
        <div class="help-inline" data-error></div>\
      </div>\
      <div class="help-block"><%= help %></div>\
    </div>\
  ');

  Form.editors.Base.prototype.className = 'form-control';
  Form.Field.errorClassName = 'has-error';


  if (Form.editors.List) {

    Form.editors.List.template = _.template('\
      <div class="bbf-list">\
        <ul class="unstyled clearfix" data-items></ul>\
        <button type="button" class="btn bbf-add" data-action="add">Add</button>\
      </div>\
    ');


    Form.editors.List.Item.template = _.template('\
      <li class="clearfix">\
        <div class="pull-left" data-editor></div>\
        <button type="button" class="btn bbf-del" data-action="remove">&times;</button>\
      </li>\
    ');


    Form.editors.List.Object.template = Form.editors.List.NestedModel.template = _.template('\
      <div class="bbf-list-modal"><%= summary %></div>\
    ');

  }


})(Backbone.Form);
