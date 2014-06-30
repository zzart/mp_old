Controller =    require 'controllers/base/controller'
StructureView = require 'views/structure-view'
Header =        require 'views/header-view'
Footer =        require 'views/footer-view'
NavFooter =     require 'views/footer-edit-view'
ListFooter =    require 'views/footer-list-view'
InfoView =      require 'views/info-view'
ConfirmView =   require 'views/confirm-view'
ViewedView =    require 'views/viewed-view'
PopGenericView =require 'views/popgeneric-view'
LeftPanelView = require 'views/left-panel-view'
RightPanelView = require 'views/right-panel-view'

module.exports = class StructureController extends Controller
    beforeAction: (params, route) ->
        @publishEvent('log:debug', 'StructureController start ------------')
        #should provide regions
        @reuse 'structure', StructureView
        #@view = new StructureView
        #@view.render().attach()
        @reuse 'header', Header, region: 'header'
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
        if route.name in edit_footer
            @reuse 'footer-nav', NavFooter, region:'footer'
        else if route.name in list_footer
            @reuse 'footer-list', ListFooter, region:'footer'
        else
            @reuse 'footer', Footer, region:'footer'

        @reuse 'panel-right', RightPanelView
        @reuse 'panel-left', LeftPanelView
        @reuse 'info', InfoView, region:'info'
        @reuse 'viewed', ViewedView, region:'viewed'
        @reuse 'confirm', ConfirmView, region:'confirm'
        @reuse 'popgeneric', PopGenericView, region:'popgeneric'
        #init panel after init jqm
        @publishEvent 'structureController:render'
        @publishEvent('log:debug', 'structureController done ----------')
