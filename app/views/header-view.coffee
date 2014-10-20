template = require 'views/templates/header_base'
View = require 'views/header-base-view'
SubView = require 'views/header-list-view'
mediator = require 'mediator'

module.exports = class HeaderView extends View
    containerMethod : 'html'
    id: 'header'
    region: 'header'
    template: template

    initialize: (options) ->
        super
        @params = options.params
        @options = options.options
        @route = options.route

    render: =>
        super

    attach: =>
        super
        @extra_header()
        $("#header").enhanceWithin()
        @publishEvent('log:debug', 'HeaderView:attach()')

    extra_header: =>
        basic = ['home_show', 'login_show', 'iframe_show']
        # depending on route we will generate extra header ( lists ) or not
        template_name = String.replace(@route.name, '#', '_')
        template_name = String.replace(template_name, '-', '_')
        if template_name in basic
            return
        @subview 'sub_header', new SubView template: "header_#{template_name}"
        @subview("sub_header").render()
