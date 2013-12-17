module.exports = class Login extends Chaplin.Model
    url: 'http://localhost:8080/v1/login'
    update_db: =>
        localStorage.clear() #clear old rubbish
        localStorage.setObject('schemas', @.get('schemas'))
        @.set({is_logged:true})



