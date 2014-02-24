module.exports = class Login extends Chaplin.Model
    url: 'http://localhost:8080/v1/login'
    update_db: =>
        localStorage.clear() #clear old rubbish
        for key, val of @.get('schemas')
            localStorage.setObject(key, val)
        for key, val of @.get('forms')
            localStorage.setObject(key, val)
        localStorage.setObject('categories', @.get('categories'))
        localStorage.setObject('choices', @.get('choices'))
        localStorage.setObject('agents', @.get('agents'))
        localStorage.setObject('branches', @.get('branches'))
        localStorage.setObject('clients', @.get('clients'))
        localStorage.setObject('account', @.get('account'))
        @.set({is_logged:true})


