View = require 'views/edit-view'
TabView = require 'views/listing-tab-view'
mediator = require 'mediator'
Collection = require 'models/listing-collection'
Model = require 'models/listing-model'
#Gmap = require 'views/gmap'
Omap = require 'views/openmap'

module.exports = class ListingView extends View
    initialize: (params) =>
        super
        @subscribeEvent('header:change_tab', @change_tab)
        @subscribeEvent('map:place_set', @set_address)
        @subscribeEvent('map:address_reset', @address_reset)
        @delegate 'change', "[name='category']", @rerender_form
        @delegate 'click', "#copy_address", @copy_address
        @rendered_tabs = []
        @categories = localStorage.getObject('categories')
        @map = undefined

        # if there is unsaved model create new one from saved _listing
        if _.isObject(localStorage.getObject('_unsaved'))
            unsaved = localStorage.getObject('_unsaved')
            # check route_params, destination if we have match then we coming back
            if unsaved.destination is @route_params[1].previous.path
                @model = new Model(unsaved.model)
                # after jump route_params.options.query is gone ...
                # so we using trick to get schema of already saved listing
                @model.schema = @model.get_schema()
                #@publishEvent('log:error', "comming back!")
            # cleanup
            #localStorage.removeItem('_unsaved')

        @is_new = false

    change_tab: (e)=>
        @publishEvent('log:info', "change tab #{e.target.dataset.id}")
        @tab_id = "tab_#{e.target.dataset.id}"
        @render_subview(@tab_id)

    rerender_form: (e) =>
        selected_id = parseInt(e.target.value)
        current_form_name = @form_name.substring(0, @form_name.length - 5)
        current_category_id = @categories[current_form_name]
        # console.log(e, current_category_id, current_form_name, parseInt(e.target.value))
        if current_category_id isnt selected_id
            # flip categories dict and construct ie. flat_sell_schema
            cat = _.invert(@categories)
            @form_name = "#{cat[selected_id]}_form"
            @model.schema = @model.get_schema()
            @rendered_tabs = []
            $("#content").empty()
            @render()
            @render_subview()

    update_home_page: ->
        @publishEvent('log:debug','update_home_page')
        # if model has been saved we will most probably need to refresh HOMEPAGE view
        # instead of doing another fetch and putting it to localstorage we can do it now
        # look for ids in localstorage and replace or add this new model
        # NOTE: JSON.stringify to comply with a server response ( which is a string type )
        # for LATEST_MODYFIED models on home page
        latest_modyfied = new Collection
        latest_modyfied.set(JSON.parse(localStorage.getObject('latest_modyfied')))
        @publishEvent('log:debug', "check for latest_modyfied: #{latest_modyfied.get(@model.id)}")
        if _.isUndefined(latest_modyfied.get(@model.id))
            #remove one form the back
            latest_modyfied.pop()
            # append new one to the beginning
            latest_modyfied.unshift(@model)
            localStorage.setObject('latest_modyfied', JSON.stringify(latest_modyfied))
        else
            #get rid of old model
            latest_modyfied.remove(@model.id)
            # append new one to the beginning
            latest_modyfied.unshift(@model)
            localStorage.setObject('latest_modyfied', JSON.stringify(latest_modyfied))

        # for NEW models on home page
        if @is_new
            latest = new Collection
            latest.set(JSON.parse(localStorage.getObject('latest')))
            if _.isUndefined(latest.get(@model.id))
                #remove one form the back
                latest.pop()
                # append new one to the beginning
                latest.unshift(@model)
                localStorage.setObject('latest', JSON.stringify(latest))
            else
                #get rid of old model
                latest.remove(@model.id)
                # append new one to the beginning
                latest.unshift(@model)
                localStorage.setObject('latest', JSON.stringify(latest))


    save_action: (url) =>
        @publishEvent('log:info', 'custom save caught')
        # need to check before record is commited to the server and becomes old ....
        @is_new = @model.isNew()
        @publishEvent 'log:debug', "Rekord nowy : #{@is_new}"

        @publishEvent('log:debug','commmit form')
        #run model and schema validation
        errors = @form.commit({validate:true})
        if _.isUndefined(errors)
            @model.save({},{
                success:(event) =>
                    wait: true
                    if mediator.collections.listings?
                        # add it to collection so we don't need to use server ...
                        mediator.collections.listings.add(@model)
                    # if model has been saved we will most probably need to refresh HOMEPAGE view
                    @update_home_page()
                    @publishEvent 'tell_user', "Rekord #{@model.get_url()} zapisany"
                    # if no query being done and we doing save this changs forever
                    # so redirect to HOME if url or listing.query is undefined
                    if mediator.collections.listings?.query?
                        # Chaplin.utils.redirectTo {url: url ? "/oferty?#{$.param(mediator.collections.listings.query)}"}
                        Chaplin.utils.redirectTo url: "/oferty?category=#{@model.get_category()}"
                    else
                        Chaplin.utils.redirectTo {url: url ? "/"}
                error:(model, response, options) =>
                    if response.responseJSON?
                        Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                    else
                        Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
            })
        else
            @publishEvent 'tell_user', "Błąd w formularzu! Pola #{@get_errors(errors)} należy wypełnić."
        # delete unsaved_listing if there are any
        @publishEvent('remove_unsaved')


    delete_action: =>
        #super
        @publishEvent('log:info', 'custom delete caught')
        @model.destroy
            success: (event) =>
                # type = _.invert(localStorage.getObject('category'))[@model.get('category')]
                mediator.collections.listings?.remove(@model)
                @publishEvent 'tell_user', 'Rekord został usunięty'
                # if no query being done and we doing save this changs forever
                # so redirect to HOME if url or listing.query is undefined
                if mediator.collections.listings?.query?
                    Chaplin.utils.redirectTo url: "/oferty?category=#{@model.get_category()}"
                else
                    Chaplin.utils.redirectTo {url: url ? "/"}
            error:(model, response, options) =>
                if response.responseJSON?
                    Chaplin.EventBroker.publishEvent 'tell_user', response.responseJSON['title']
                else
                    Chaplin.EventBroker.publishEvent 'tell_user', 'Brak kontaktu z serwerem'
        @publishEvent('remove_unsaved')

    back_action: =>
        @publishEvent('remove_unsaved')
        # we can't just inherit it from view class
        Chaplin.utils.redirectTo url: "/oferty?category=#{@model.get_category()}"
        # Chaplin.utils.redirectTo url: "#{@route_params[1]['previous']['path']}?#{@route_params[1]['previous']['query']}"

    set_address: (place) ->
        @publishEvent('log:debug', "set address with #{place}")
        $("[name='internet_postcode']").val()
        $("[name='internet_street']").val()
        $("[name='internet_town']").val()
        $("[name='internet_province']").val()
        $("[name='internet_town_district']").val()
        $("[name='internet_lat']").val()
        $("[name='internet_lon']").val()
        $("[name='internet_borough']").val()
        $("[name='internet_county']").val()

    copy_address: (event) ->
        @publishEvent('log:debug', 'copy address event')
        event.preventDefault()
        $("[name='internet_postcode']").val($("[name='postcode']").val())
        $("[name='internet_street']").val(  $("[name='street']").val())
        $("[name='internet_town']").val(    $("[name='town']").val())
        $("[name='internet_province']").val($("[name='province']").val())
        $("[name='internet_town_district']").val( $("[name='town_district']").val())
        $("[name='internet_lat']").val(     $("[name='lat']").val())
        $("[name='internet_lon']").val(     $("[name='lon']").val())
        $("[name='internet_borough']").val( $("[name='borough']").val())
        $("[name='internet_county']").val($("[name='county']").val())

    render: =>
        #NOTE:
        #we want to split it into parts which we can render quickly
        super
        @get_form()
        base_template = @form.template()
        $bt = $(base_template)
        $bt.find('.ui-grid-a').remove()
        @$el.append($bt)
        @publishEvent('log:debug', 'view: edit-view RenderEnd()')

    render_subview: (tab_id='tab_1')=>
        #NOTE: this assumes that we don't have more then 9 tabs (value [1] gets only one digit and substracts one for array compatybility) !!
        @publishEvent('log:debug', "render sub_view #{tab_id}")
        if tab_id not in @rendered_tabs
            $temp = $(@form.el).find("##{tab_id}")
            # console.log('---> ', @form.el, $temp, tab_id)
            @subview tab_id, new TabView container: @el, template: $temp, id: "content_#{tab_id}"
            @subview(tab_id).render()

            if tab_id is 'tab_6'
                @init_events()
                @init_uploader()
                @init_sortable()
            if tab_id is 'tab_1'
                # lets set category whatever the form might be
                current_form_name = @form_name.substring(0, @form_name.length - 5)
                current_category_id = @categories[current_form_name]
                $("[name='category']").val(current_category_id)

            @publishEvent 'jqm_refersh:render'
            @rendered_tabs.push(tab_id)

            # adres autocomplete has to attach itself AFTER render
            if tab_id is 'tab_2'
                # check if we have an instance already
                if @map is undefined
                    @map = new Omap model:@model, render_map:true, div: tab_id
        else
            #we've rendered this tab already so just make it visible
            $('div[id^=content_tab_]').css('display', 'none')
            # unhide the one we need
            $("#content_#{tab_id}").css('display', 'inline')

    fill_address_call: (e) ->
        # this is incredibly stupid by i can't register event inside Omap class
        # TODO : ?
        @map.fill_address(e)

    address_reset: ->
        @publishEvent('log:debug', 'address reset')
        $("[name='internet_postcode']").val('')
        $("[name='postcode']").val('')
        $("[name='internet_street']").val('')
        $("[name='street']").val('')
        $("[name='internet_town']").val('')
        $("[name='town']").val('')
        $("[name='internet_province']").val('')
        $("[name='province']").val('')
        $("[name='internet_town_district']").val('')
        $("[name='town_district']").val('')
        $("[name='internet_lat']").val('')
        $("[name='lat']").val('')
        $("[name='internet_lon']").val('')
        $("[name='lon']").val('')
        $("[name='internet_borough']").val('')
        $("[name='borough']").val('')
        $("[name='internet_county']").val('')
        $("[name='county']").val('')
        $("[name='number']").val('')

    attach: =>
        super
        @publishEvent('log:debug', "listing-add attach")
        @render_subview()
        @add_jump_option('client') # moved to base/view.coffee
        @check_inserted()

    check_inserted: =>
        # TODO: make generic
        # this checks if choice fields have all selections as needed
        # in case they don't we will insert them manually
        ls = localStorage.getObject('_model_saved')
        if !!ls is false
            return  # if nothing was saved lately then return
        sh = @model.schema.client.options
        # take only val field and compare two objects
        arr = []
        for obj in sh
            arr.push(parseInt(obj.val))
        if _.contains(arr, parseInt(ls.id)) is false
            @publishEvent('log:warning', "check_inserted: field missing #{parseInt(ls.id)} from array #{arr}")
            #get el
            el = $("select[id$='_client']")
            el.append("<option value='#{parseInt(ls.id)}'>#{ls.first_name} #{ls.surname}</option>")
        else # just check for right name
            @publishEvent('log:info', "check_inserted: check name val= #{parseInt(ls.id)}")
            el = $("select[id$='_client'] option[value='#{parseInt(ls.id)}']")
                .html("#{ls.first_name} #{ls.surname}")
                .attr('selected', true)
                .siblings('option').removeAttr('selected')
            $("select[id$='_client']").selectmenu("refresh", true)

