module.exports = class Login extends Chaplin.Model
    url: 'http://localhost:8080/v1/login'
    update_db: =>
        localStorage.clear() #clear old rubbish
        for key, val of @.get('schemas')
            localStorage.setObject(key, val)
        for key, val of @.get('forms')
            localStorage.setObject(key, val)
        localStorage.setObject('categories', @.get('categories'))
        localStorage.setObject('categories_full', @.get('categories_full'))
        localStorage.setObject('choices', @.get('choices'))
        localStorage.setObject('agents', @.get('agents'))
        localStorage.setObject('branches', @.get('branches'))
        localStorage.setObject('clients', @.get('clients'))
        localStorage.setObject('account', @.get('account'))
        localStorage.setObject('latest', @.get('latest'))
        localStorage.setObject('latest_modyfied', @.get('latest_modyfied'))
        localStorage.setObject('update_needed', @.get('update_needed'))
        localStorage.setObject('portals', @.get('portals'))
        @.set({is_logged:true})


