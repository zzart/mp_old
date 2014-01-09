View = require 'views/base/view'
mediator = require 'mediator'
module.exports = class View extends View
    autoRender: true
    className: 'ui-content'
    initialize: (options) =>
        @template = options.template
        @id = options.id # corresponds to yaml file tab id
    render: =>
        super
        @publishEvent('log:info', 'tabview: tab-view render()')
        @$el.append(@template)
    attach: =>
        #NOTE: not calling SUPER here so we can manually append EL to CONTAINER the way we want it
        #and we need it inside the form element
        $(@container).find('form div:first').append(@$el)
        @publishEvent('log:info', 'tabview: tab-view afterAttach()')
