Controller =    require 'controllers/base/controller'
StructureView = require 'views/structure-view'
Header =        require 'views/header-view'
EditHeader =    require 'views/header-edit-view'
# ListHeader =    require 'views/header-list-view'
Footer =        require 'views/footer-view'
NavFooter =     require 'views/footer-edit-view'
ListFooter =    require 'views/footer-list-view'
InfoView =      require 'views/info-view'
ConfirmView =   require 'views/confirm-view'
ViewedView =    require 'views/viewed-view'
PopGenericView =require 'views/popgeneric-view'
LeftPanelView = require 'views/left-panel-view'
RightPanelView = require 'views/right-panel-view'
mediator = require 'mediator'

module.exports = class StructureController extends Controller
    beforeAction: (params, route, options) ->
        @publishEvent('log:debug', "StructureController controller")
        @publishEvent('log:debug', params)
        @publishEvent('log:debug', route)
        @publishEvent('log:debug', options)
        #should provide regions
        @reuse 'structure', StructureView
        #@view = new StructureView
        #@view.render().attach()
        # HEADER -------------------------------------
        edit_listing_header = [
            'listing#add',
            'listing#show',
        ]
        edit_header = [
            'client#add',
            'client#show',
            'client-public#show',
            'branch#add',
            'branch#show',
            'agent#add',
            'agent#show',
            'bon#show',
        ]
        single_header = [
            'graphic#show',
            'graphic#add',
            'export#add',
            'export#show',
        ]

        if route.name in edit_listing_header
            # NOTE: doing different tabs depending on category doesn't work
            # we don't know listing category when clicked on
            # we can only tell category (route.query/options.query) when user adds NEW one
            @reuse 'header-edit', EditHeader, tabs: [
                'Oferta', 'Adres', 'Nieruchomość', 'Szczegóły', 'Pozostałe', 'Zdjęcia / Eksporty' ]
        else if route.name in edit_header
            @reuse 'header-edit', EditHeader, tabs: ['Szczegóły','Pliki']
        else if route.name in single_header
            @reuse 'header-edit', EditHeader, tabs: ['Szczegóły']
        else
            @reuse 'header', Header, {params:params, route:route, options:options}

        # Footer -------------------------------------
        edit_footer = [
            'listing#add',
            'listing#show',
            'client#add',
            'client#show',
            'client-public#show',
            'branch#add',
            'branch#show',
            'agent#add',
            'agent#show',
            'bon#show'
            'graphic#add',
            'graphic#show'
            'export#add',
            'export#show'
            ]
        list_footer = [
            'listing#list',
            'client#list',
            'client-public#list',
            'branch#list',
            'agent#list',
            'bon#list'
            'graphic#list'
            'export#list'
            ]
        empty = ['login#show']
        if route.name in edit_footer
            @reuse 'footer-nav', NavFooter, region:'footer'
        else if route.name in list_footer
            @reuse 'footer-list', ListFooter, region:'footer'
        else if route.name not in empty
            @reuse 'footer', Footer, region:'footer'

        @reuse 'panel-right', RightPanelView
        @reuse 'panel-left', LeftPanelView
        @reuse 'info', InfoView, region:'info'
        @reuse 'viewed', ViewedView, region:'viewed'
        @reuse 'confirm', ConfirmView, region:'confirm'
        @reuse 'popgeneric', PopGenericView, region:'popgeneric'
        #init panel after init jqm
        @publishEvent 'structureController:render'
        @test_divs()
        @publishEvent('log:debug', 'structureController done ----------')



    test_divs: ->
        # NOTE: for some strange reason sometimes when you go from listview to home view <divs> start going missing
        # and everything crases due to not having any <divs> to attach to
        # this is hard to debug as it's inconsistant (maybe jqm 1.4.2, or chaplin reuse) ...!
        # this ensures that by the time we are done with this controller we have structure in place no matter what happens

        @regions = [
            'content-region',
            'header-region',
            'footer-region',
            'info-region',
            'viewed-region',
            'login-region',
            'confirm-region',
            'popgeneric-region',
        ]
        @attribs = {
            'content-region': 'role="main" class="ui-content"',
            'header-region': 'data-role="header" data-theme="b"',
        }
        for val in @regions
            if $("##{val}").length is 0
                @publishEvent('log:warning', "No div present #{val}!! Appending manually!")
                $("#page").append("<div id='#{val}' #{@attrib[val] or ''}></div>")
        #if there are any footers outside #page kill them grrrr...
        $("body > #footer").remove()

