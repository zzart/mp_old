template = require 'views/templates/home'
View = require 'views/base/view'
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
        title:"na homepage!"

    attach: =>
        super
        @publishEvent('log:info', 'HomeView: attach()')

        #  dispose: =>
        #      super
        #      @publishEvent('log:info', 'home-page-view dispose()')

