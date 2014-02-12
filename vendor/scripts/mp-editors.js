// https://github.com/powmedia/backbone-forms/issues/144
// Custom editors , all require full names   Backbone.Form.editors

     // like 'Select' editor, but will always return a boolean (true or false)

  Backbone.Form.editors.Range =  Backbone.Form.editors.Text.extend({
        //events: _.extend({}, Backbone.Form.editors.Text.prototype.events, {
        //    'change': function(event) {
        //        this.trigger('change', this);
        //    }
        //}),
        initialize: function(options) {
          Backbone.Form.editors.Text.prototype.initialize.call(this, options);
          //this.$el.attr('type', 'range');

        //  if (this.schema.appendToLabel) {
        //      this.updateLabel();
        //      this.on('change', this.updateLabel, this);
        //  }
        },
        getValue: function() {
            var val = Backbone.Form.editors.Text.prototype.getValue.call(this);
            //var val = this.form.fields.
            //var val = this.$el.find('input').val();
            //var val = this.$el.find('input').val();
            //var val = this.$el.find('input').val();
            console.log(this.$el);
            console.log(val, this);
            return parseInt(val, 100);
        },
        setValue: function(value) {
        //    var val = Backbone.Form.editors.Text.prototype.getValue.call(this);

            window.aa = this;
            Backbone.Form.editors.Select.prototype.setValue.call(this, value);

        },
        render: function() {
            console.log(this, this.value);
            this.setValue(this.value);

            return this;
        },

        //updateLabel: function() {
        //    _(_(function() {
        //        var $label = this.$el.parents('.bbf-field').find('label');
        //        $label.text(this.schema.title + ': ' + this.getValue() + (this.schema.valueSuffix || ''));
        //    }).bind(this)).defer();
        //}
    });



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
