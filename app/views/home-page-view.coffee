template = require 'views/templates/home'
View = require 'views/base/view'
Collection = require 'models/listing-collection'
mediator = require 'mediator'
module.exports = class HomePageView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    template: template
    className: 'ui-content'
    #initialize: ->
    #    @delegate 'mouseenter', @route_change

    #route_change:(e) ->
    #    console.log('hover')
    #    @publishEvent('refreshmodel', 'flat_rent/form')


    getTemplateData: =>
        # lets create collections so that we can use all the models goodies in the templates
        listings1 = new Collection
        listings2 = new Collection
        listings3 = new Collection
        listings1.set(JSON.parse(localStorage.getObject('latest')))
        listings2.set(JSON.parse(localStorage.getObject('latest_modyfied')))
        listings3.set(JSON.parse(localStorage.getObject('update_needed')))

        first_name: mediator.models.user.get('first_name')
        latest :            listings1.toJSON()
        latest_modyfied :   listings2.toJSON()
        update_needed :     listings3.toJSON()

    attach: =>
        super
        @publishEvent('log:info', 'HomeView: attach()')
        @publishEvent 'jqm_refersh:render'

        #  dispose: =>
        #      super
        #      @publishEvent('log:info', 'home-page-view dispose()')

