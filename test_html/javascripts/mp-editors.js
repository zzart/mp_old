// https://github.com/powmedia/backbone-forms/issues/144
// Custom editors , all require full names   Backbone.Form.editors

     // like 'Select' editor, but will always return a boolean (true or false)
    Backbone.Form.editors.BooleanSelect = Backbone.Form.editors.Select.extend({
        initialize: function(options) {
            options.schema.options = [
                { val: '', label: 'Nie' },
                { val: '1', label: 'Tak' }
            ];
            Backbone.Form.editors.Select.prototype.initialize.call(this, options);
        },
        getValue: function() {
            return !!Backbone.Form.editors.Select.prototype.getValue.call(this);
        },
        setValue: function(value) {
            value = value ? '1' : '';
            Backbone.Form.editors.Select.prototype.setValue.call(this, value);
        }
    });

    // like the 'Select' editor, except will always return a number (int or float)
//    Backbone.Form.editors.NumberSelect = Backbone.Form.editors.Select.extend({
//        getValue: function() {
//            return parseFloat(Backbone.Form.editors.Select.prototype.getValue.call(this));
//        },
//        setValue: function(value) {
//            Backbone.Form.editors.Select.prototype.setValue.call(this, parseFloat(value));
//        }
//    });


//_.extend(Backbone.Form.editors, MyProject.Form.editors);
