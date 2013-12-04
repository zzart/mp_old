Controller = require 'controllers/base/controller'
StructureView = require 'views/structure-view'
Footer = require 'views/footer-view'
Header = require 'views/header-view'
LeftPanelView = require 'views/left-panel-view'
InfoView = require 'views/info-view'
ConfirmView = require 'views/confirm-view'

module.exports = class StructureController extends Controller
    beforeAction: ->
        @publishEvent('log:info', 'StructureController.beforeAction()')
        #should provide regions
        @compose 'structure', StructureView
        @compose 'header', Header, region: 'header'
        @compose 'footer', Footer, region:'footer'
        @compose 'panel-left', LeftPanelView
        @compose 'info', InfoView, region:'info'
        @compose 'confirm', ConfirmView, region:'confirm'
        #init panel after init jqm
        @publishEvent 'structureController:render'
        @publishEvent('log:info', 'structureController done ----------')
