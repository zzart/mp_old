template = require 'views/templates/popgeneric'
View = require 'views/base/view'

module.exports = class PopGenericView extends View
    template: template
    containerMethod : 'html'
    id: 'popgeneric'
    attributes: { 'data-role':'popup','data-theme':'b', 'data-position-to':'window', 'data-arrow':'true'}
    className:'ui-content-popup'
