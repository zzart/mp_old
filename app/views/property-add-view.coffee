View = require 'views/edit-view'
mediator = require 'mediator'
module.exports = class PropertyAddView extends View
    initialize: (options) =>
        super
        # send url data from controler
        @params = options
        console.log(@params)



        # form_help:(event) =>
        #     @publishEvent 'tell_user' , event.target.text

        # save_form: =>
        #     @publishEvent('log:info','commmit form')
        #     #run model and schema validation
        #     if _.isUndefined(@form.commit({validate:true}))
        #         @model.save({},{
        #             success:(event) =>
        #                 if mediator.collections.property?
        #                     # add it to collection so we don't need to use server ...
        #                     mediator.collections.property.add(@model)
        #                 @publishEvent 'tell_user', 'Oddział dodany'
        #                 Chaplin.utils.redirectTo {url: '/oddzialy'}
        #             error:(model, response, options) =>
        #                 if response.responseJSON?
        #                     Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
        #                 else
        #                     Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
        #         })
        #     else
        #         @publishEvent 'tell_user', 'Błąd w formularzu!'

        # refresh_form: =>
        #     render()


