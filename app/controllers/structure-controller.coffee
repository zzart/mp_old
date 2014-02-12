Controller = require 'controllers/base/controller'
StructureView = require 'views/structure-view'
Header = require 'views/header-view'
Footer = require 'views/footer-view'
NavFooter = require 'views/footer-edit-view'
ListFooter = require 'views/footer-list-view'
LeftPanelView = require 'views/left-panel-view'
InfoView = require 'views/info-view'
ConfirmView = require 'views/confirm-view'

module.exports = class StructureController extends Controller
    beforeAction: (params, route) ->
        @publishEvent('log:info', 'StructureController start ------------')
        #should provide regions
        @compose 'structure', StructureView
        @compose 'header', Header, region: 'header'
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
            ]
        list_footer = [
            'listing#list',
            'client#list',
            'client-public#list',
            'branch#list',
            'agent#list',
            'bon#list'
            'graphic#list'
            ]
        if route.name in edit_footer
            @compose 'footer-nav', NavFooter, region:'footer'
        else if route.name in list_footer
            @compose 'footer-list', ListFooter, region:'footer'
        else
            @compose 'footer', Footer, region:'footer'
        @compose 'panel-left', LeftPanelView
        @compose 'info', InfoView, region:'info'
        @compose 'confirm', ConfirmView, region:'confirm'
        #init panel after init jqm
        @publishEvent 'structureController:render'
        @publishEvent('log:info', 'structureController done ----------')
