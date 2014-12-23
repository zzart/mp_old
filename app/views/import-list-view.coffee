View = require 'views/list-view'
mediator = require 'mediator'

module.exports = class ImportListView extends View
    initialize: (params) ->
        super
        @subscribeEvent 'navigation:import_info', @import_info
        @subscribeEvent 'import_data:ready', @import_data
        @module_name = 'ImportListView'

    import_data: =>
        '''sends info to the server that user is ready to start import procedure'''
        # e.preventDefault()
        @publishEvent('log:info', "import_data_called")
        url = "#{mediator.server_url}v1/parser/import"
        @mp_request(@model, url, 'GET', 'Rozpoczynam import ofert. Po zakończeniu wyślę emaila do admina.')

    import_info: (e) =>
        '''This just displays popup window informing user about import procedure'''
        e.preventDefault()
        self = @
        @publishEvent('log:info', "#{@module_name} import_info id:#{e.target.id} ")
        val = "<h5>Import ofert</h5><br />
            <p>Import w zależności od wielkości pliku może zająć od 1-15min. O zaimportowaniu danych zostaną państwo poinformowani emailowo. Po pomyślnym imporcie należy się ponownie zalogować. </p><p><b>Uwaga</b> CAŁOŚCIOWY import danych wiąże się ze <b>skasowaniem</b> wszystkich dotychczasowych ofert w bazie danych!!</p>
            <p>Import ofert odbywa się w 3 krokach. </p>
            <ul>
            <li>Zaznacz prawidłowy format eksportu Menu -> Ustawienia -> Dane Biura Nieruchomości</li>
            <li>Prześlij na konto ftp paczkę w formacie *.zip (dane do logowania zostały przesłane w emailu po rejestracji).</li>
            <li>Naciśnij zaimportuj oferty.</li>
            </ul>
            <div class='ui-grid-a'>
                <div class='ui-block-a'>
                    <button id='got_it'>Powrót</button>
                </div>
                <div class='ui-block-b'>
                    <button id='import_data'>Zaimportuj oferty</button>
                </div>
            </div>
            "
        $('#popgeneric').html(val)
        $ul = $("#popgeneric")
        try
            $ul.enhanceWithin()
        catch error
            @publishEvent("log:warn", error)
        $('#popgeneric').popup('open',{ transition:"fade" })
        # unbind is for stopping it firing multiple times
        $("#got_it").unbind().click ->
            $('#popgeneric').popup('close')
            $("#right-panel").panel('close')
        $("#import_data").unbind().click ->
            self.publishEvent('import_data:ready')
            $('#popgeneric').popup('close')
            $("#right-panel").panel('close')

    attach: =>
        super
        @publishEvent('log:info', "#{@module_name} afterRender()")

