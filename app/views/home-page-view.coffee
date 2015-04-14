template = require 'views/templates/home'
View = require 'views/base/view'
Collection = require 'models/listing-collection'
# Footer = require 'views/footer-view'
mediator = require 'mediator'

module.exports = class HomePageView extends View
    autoRender: true
    containerMethod: "html"
    #attributes: { 'data-role':'content' }
    id: 'content'
    template: template
    #className: 'ui-content'

    initialize: ->
        @latest_exist = false

    getTemplateData: =>
        # lets create collections so that we can use all the models goodies in the templates
        listings1 = new Collection
        listings2 = new Collection
        listings3 = new Collection
        listings1.set(JSON.parse(localStorage.getObject('latest')))
        listings2.set(JSON.parse(localStorage.getObject('latest_modified')))
        listings3.set(JSON.parse(localStorage.getObject('update_needed')))
        @publishEvent('log:debug', "latest: #{listings1.length}")
        if listings1.length > 0
            @latest_exist = true
        #first_name: mediator.models.user.get('first_name')
        latest :            listings1.toJSON()
        latest_modified :   listings2.toJSON()
        update_needed :     listings3.toJSON()

    attach: =>
        super
        if @latest_exist is false
            @publishEvent 'tell_user', 'Witaj w programie MobilnyPośrednik!<br /> Menu <a class="ui-btn ui-shadow ui-corner-all ui-icon-bars ui-btn-icon-notext ui-btn-inline">bars</a>jest do nawigacji.'
        @publishEvent('log:debug', 'HomeView: attach()')
        @publishEvent 'jqm_refersh:render'

