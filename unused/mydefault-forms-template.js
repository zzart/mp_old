/**
 * Include this file _after_ the main backbone-forms file to override the default templates.
 * You only need to include templates you want to override.
 *
 * Requirements when customising templates:
 * - Each template must have one 'parent' element tag.
 * - "data-type" attributes are required.
 * - The main placeholder tags such as the following are required: fieldsets, fields
 */
;(function() {
  var Form = Backbone.Form;


  //DEFAULT TEMPLATES
  Form.setTemplates({

    //HTML
    form: '\
      <form class="bbf-form" action="#" method="#">{{fieldsets}}\
         <fieldset class="ui-grid-a">\
            <div class="ui-block-a"><button type="submit" data-theme="d" >Wyczyść</button></div>\
                <div class="ui-block-b"><button type="submit" data-theme="a" id="save_offer">Zapisz!</button></div>\
            </fieldset>\
    ',

    fieldset: '\
    <div>\
        {{fields}}\
      </div>\
    ',
  select: '\
      <div data-role="fieldcontain">\
      <label for="{{id}}">{{title}}</label>\
      {{editor}}\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
    </div>\
  ',
  bool: '\
      <div data-role="fieldcontain">\
      <label for="{{id}}">{{title}}</label>\
      {{editor}}\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
    </div>\
  ',

  field: '\
      <div data-role="fieldcontain">\
      <label for="{{id}}">{{title}}</label>\
      {{editor}}\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
    </div>\
  ',
  mydate: '\
      <div data-role="fieldcontain">\
      {{editor}}\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
    </div>\
  ',
  radio: '\
      <div data-role="fieldcontain">\
      {{editor}}\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
    </div>\
  ',
    nestedField: '\
      <li class="bbf-field bbf-nested-field field-{{key}}" title="{{title}}">\
        <label for="{{id}}">{{title}}</label>\
        <div class="bbf-editor">{{editor}}</div>\
        <div class="bbf-help">{{help}}</div>\
        <div class="bbf-error">{{error}}</div>\
      </li>\
    ',

    list: '\
      <div class="bbf-list">\
        <ul>{{items}}</ul>\
        <div class="bbf-actions"><button type="button" data-action="add">Add</div>\
      </div>\
    ',

    listItem: '\
      <li>\
        <button type="button" data-action="remove" class="bbf-remove">&times;</button>\
        <div class="bbf-editor-container">{{editor}}</div>\
      </li>\
    ',

    date: '\
      <fieldset class="bbf-date" data-role="controlgroup" data-type="horizontal">\
        <label for="select-choice-day">Dzień</label>\
        <select id="select-choice-day" name="select-choice-day" data-type="date" class="bbf-date">{{dates}}</select>\
        <label for="select-choice-month">Miesiąc</label>\
        <select id="select-choice-month" name="select-choice-month" data-type="month" class="bbf-month">{{months}}</select>\
        <label for="select-choice-year">Rok</label>\
        <select id="select-choice-year" name="select-choice-year" data-type="year" class="bbf-year">{{years}}</select>\
      </fieldset>\
    ',

    dateTime: '\
      <div class="bbf-datetime">\
        <div class="bbf-date-container">{{date}}</div>\
        <select data-type="hour">{{hours}}</select>\
        :\
        <select data-type="min">{{mins}}</select>\
      </div>\
    ',

    'list.Modal': '\
      <div class="bbf-list-modal">\
        {{summary}}\
      </div>\
    '
  }, {

    //CLASSNAMES
    error: 'bbf-error'

  });


})();
