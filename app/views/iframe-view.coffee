template = require 'views/templates/iframe'
View = require 'views/base/view'
module.exports = class IFrameView extends View
    autoRender: true
    containerMethod: "html"
    attributes: { 'data-role':'content' }
    id: 'content'
    template: template
    className: 'ui-content'
    initialize: (options)->
        dic =
            geodz:
                url: 'http://mapy.geoportal.gov.pl/imap/?gpmap=gp0&actions=acShowWgPlot'
                title: ''
            geo:
                url: 'http://maps.geoportal.gov.pl/webclient/'
                title: ''
            calendar:
                url: 'https://www.google.com/calendar'
                title: ''
            video_logowanie:
                url: '//www.youtube.com/embed/bMG_6xa0qRA'
                title: ''
        @url = dic[options.template]['url']
        @title = dic[options.template]['title']


    getTemplateData: =>
        title:@title
        url: @url
        width: $(document.body).width()
        height: $(document.body).height()


    attach: =>
        super
        @publishEvent('log:info', 'IFrameView: attach()')
