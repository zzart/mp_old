{config} = require './config'
console.log("SET mediator.mobile = true !!!!!!!!!!!!! config-release.coffee")

config.files.javascripts.joinTo =
# (1) get them all in one file
    'javascripts/app.js': /^(app|vendor)/
    #'javascripts/app.js': /^app/
#config.files.javascripts.optimize = true
#config.files.javascripts.sourceMaps = false
config.optimize = true
config.sourceMaps = false

exports.config = config
#- See more at: http://hackerpreneurialism.com/post/40039506659/brunch-io-release-config-build#sthash.ddYNyygt.dpuf
