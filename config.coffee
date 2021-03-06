dotenv = require 'dotenv'
dotenv.load()
production = Boolean(process.env.ENVIRONMENT)
#console.log("production set to : #{process.env.ENVIRONMENT}, for production envoke ENVIRONMENT=\"production\" brunch b --config config-release.coffee")
exports.config =
  # See http://brunch.readthedocs.org/en/latest/config.html for documentation.
  # NOTE: WATCH FOR COMMMMMMMMMMMMMMAS !!!!!!!!!!!!!!!!!
  # NOTE: ALL FILES (in vendor dir) ARE COMPRESSED ANYWAY !!!!!!!!!!!!!!
    files:
        javascripts:
            joinTo:
                'javascripts/app.js': /^app/
                'javascripts/vendor.js': /^vendor/
                #'javascripts/vendor.js': /^vendor/
                'test/javascripts/test.js': /^test[\\/](?!vendor)/
                'test/javascripts/test-vendor.js': /^test[\\/](?=vendor)/
            order:
                # Files in `vendor` directories are compiled before other files
                # even if they aren't specified in order.before.
                before: [
                    'vendor/scripts/console-helper.js',
                    'vendor/scripts/bowser.js',
                    # 'vendor/scripts/offline.min.js',
                    #'vendor/scripts/log4javascript.js',
                    #'vendor/scripts/jquery-1.11.1.min.js',
                    'vendor/scripts/jquery.min.js', #2.1.3
                    'vendor/scripts/jquery-ui.js',  #1.11
                    #'vendor/scripts/jquery-ui-1.10.4.custom.js',
                    'vendor/scripts/jquery.ui.touch-punch.js',
                    'vendor/scripts/jquery.mobile.setup.js',#!!!
                    # 'vendor/scripts/jquery.mobile-1.4.5.js',
                    'vendor/scripts/jquery.mobile.js', #1.4.5 custom
                    # 'vendor/scripts/queue.min.js',
                    #'vendor/scripts/async.js',
                    'vendor/scripts/underscore-1.8.3.js',
                    'vendor/scripts/backbone-1.10.js',
                    'vendor/scripts/chaplin-1.0.1.js',
                    #'vendor/scripts/backbone.dualstorage.coffee',
                    #'vendor/scripts/chaplin-0.12.js',
                    'vendor/scripts/backbone-forms.js',
                    'vendor/scripts/bootstrap.js',
                    'vendor/scripts/backbone.bootstrap-modal.js',
                    'vendor/scripts/mp-editors.js',
                    'vendor/scripts/default-forms-template.js',
                    'vendor/scripts/list.js',
                    'vendor/scripts/jquery.tablesorter.min.js',
                    'vendor/scripts/hmac-sha256.js',
                    'vendor/scripts/enc-base64-min.js',
                    # moved to async
                    #'vendor/scripts/fine-uploader.js',
                    #'vendor/scripts/OpenLayers.js',
                    'vendor/scripts/jquery.cookie.js'
                    ]
                after: [
                    'test/vendor/scripts/test-helper.js'
                    ]

        stylesheets:
            joinTo:
                'stylesheets/app.css': /^(app|vendor)/
                'test/stylesheets/test.css': /^test/
            order:
                before: [
                    'vendor/styles/fineuploader-4.2.1.css',
                    # 'vendor/styles/fineuploader-5.0.3.css',
                    'vendor/styles/jquery.mobile-1.4.5.css',
                    #'vendor/styles/jquery.mobile-1.4.0.min.css',
                    #'vendor/styles/jquery.mobile-1.4.0-rc.1.css',
                    #'vendor/styles/openlayers.css',
                    #'vendor/styles/jqm-icon-pack-fa.css',
                    ]
                #after: ['vendor/styles/helpers.css']
                #'vendor/styles/normalize-2.0.1.css',

        templates:
            joinTo: 'javascripts/app.js'

            #overrides:
            #    production:
            #        javascripts:
            #            joinTo:
            #                'javascripts/app.js': /^vendor/
            #                'javascripts/app.js': /^app/
            #            #order:
            #            #    # Files in `vendor` directories are compiled before other files
            #            #    # even if they aren't specified in order.before.
            #            #    before: [
            #            #        'vendor/scripts/console-helper.js',
            #            #        'vendor/scripts/log4javascript.js',
            #            #        'vendor/scripts/jquery-1.10.2.min.js',
            #            #        'vendor/scripts/jquery-ui-1.10.4.custom.js',
            #            #        'vendor/scripts/jquery.ui.touch-punch.js',
            #            #        'vendor/scripts/jquery.mobile.setup.js',#!!!
            #            #        'vendor/scripts/jquery.mobile-1.4.0.js',
            #            #        # 'vendor/scripts/queue.min.js',
            #            #        'vendor/scripts/async.js',
            #            #        #'vendor/scripts/jquery.mobile-1.4.0-rc.1.js',
            #            #        #'vendor/scripts/jquery.mobile-1.3.2.min.js',
            #            #        'vendor/scripts/underscore-1.4.3.js',
            #            #        'vendor/scripts/backbone-1.10.js',
            #            #        'vendor/scripts/chaplin-0.12.js',
            #            #        'vendor/scripts/backbone-forms.js',
            #            #        'vendor/scripts/bootstrap.js',
            #            #        'vendor/scripts/backbone.bootstrap-modal.js',
            #            #        'vendor/scripts/mp-editors.js',
            #            #        'vendor/scripts/default-forms-template.js',
            #            #        'vendor/scripts/list.js',
            #            #        'vendor/scripts/jquery.tablesorter.min.js',
            #            #        'vendor/scripts/hmac-sha256.js',
            #            #        'vendor/scripts/enc-base64-min.js',
            #            #        'vendor/scripts/fineuploader-4.2.1.js',
            #            #        'vendor/scripts/OpenLayers.js'
            #            #        ]
            #        optimize: true
            #        sourceMaps: false
            #        plugins: autoReload: enabled: false
