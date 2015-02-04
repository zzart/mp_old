
module.exports = class Gmap

    initialize: (options) ->
        super
        @map_div = document.getElementById(options.map_div or 'openmap')
        @autocomplete_div = document.getElementById(options.autocomplete_div) or document.querySelectorAll('[data-type=search]')
        @map = undefined
        @places = undefined
        @markers = []
        @autocomplete = undefined

        if !!options.autocomplete
            @init_autocomplete()
        if !!options.map
            @init_map()
        @publishEvent 'log:debug','Gmap instantiated'

    init_map: =>
        @countries =
            pl:
                center: new google.maps.LatLng(51.919438, 19.145136)
                zoom: 6
        @countryRestrict = country: "pl"
        @MARKER_PATH = "https://maps.gstatic.com/intl/en_us/mapfiles/marker_green"
        hostnameRegexp = new RegExp("^https?://.+?/")
        myOptions =
            zoom: @countries["pl"].zoom
            center: @countries["pl"].center
            mapTypeControl: false
            panControl: false
            #zoomControl: false
            streetViewControl: false
            mapTypeId: google.maps.MapTypeId.ROADMAP
            styles: @mapStyles()

        @map = new google.maps.Map(@map_div, myOptions)

    init_autocomplete: =>
        #map.controls[google.maps.ControlPosition.TOP_LEFT].push(input)
        options =
            types: ['address'],
            componentRestrictions: {country:'pl'}
        @autocomplete = new google.maps.places.Autocomplete(@autocomplete_div, options)
        @places = new google.maps.places.PlacesService(@map)
        # set up listener for user selection
        google.maps.event.addListener @autocomplete, "place_changed", @onPlaceChanged


# When the user selects a city, get the place details for the city and
# zoom the map in on the city.
    onPlaceChanged: =>
        #$("##{@map_div}").css("display", "block")
        google.maps.event.trigger(@map, 'resize')
        @place = self.autocomplete.getPlace()
        if @place.geometry
            #  df { k=50.08383310000001, B=19.962080900000046
            @publishEvent('log:debug', "got coordinates: #{@place.geometry.location}")
            @map.panTo @place.geometry.location
            @map.setZoom 14
        else
            document.getElementById("autocomplete").placeholder = "Wprowadz adres"

        #TODO: let's parse values ....
        @publishEvent('map:place_set', @place.geometry)

# Search for hotels in the selected city, within the viewport of the map.
    display_markers: =>
        self = @
        self.clearMarkers()
        markerLetter = String.fromCharCode("A".charCodeAt(0) + i)
        markerIcon = @MARKER_PATH + markerLetter + ".png"

        # Use marker animation to drop the icons incrementally on the map.
        marker = new google.maps.Marker(
            position: new google.maps.LatLng(
                @place.geometry.location['k'], @place.geometry.location['B'])
            animation: google.maps.Animation.DROP
            icon: markerIcon
            #id: listing.id
        )


    clearMarkers: =>
        $("#listing-container").html('')  # clear HTML
        self = @
        i = 0
        while i < self.markers.length
            self.markers[i].setMap null  if self.markers[i]
            i++
        self.markers = []


    dropMarker: (i) =>
        self = @
        ->
            self.markers[i].setMap self.map

    mapStyles: ->
        [{featureType:'water',elementType:'all',stylers:[{hue:'#d7ebef'},{saturation:-5},{lightness:54},{visibility:'on'}]},{featureType:'landscape',elementType:'all',stylers:[{hue:'#eceae6'},{saturation:-49},{lightness:22},{visibility:'on'}]},{featureType:'poi.park',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-81},{lightness:34},{visibility:'on'}]},{featureType:'poi.medical',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-80},{lightness:-2},{visibility:'on'}]},{featureType:'poi.school',elementType:'all',stylers:[{hue:'#c8c6c3'},{saturation:-91},{lightness:-7},{visibility:'on'}]},{featureType:'landscape.natural',elementType:'all',stylers:[{hue:'#c8c6c3'},{saturation:-71},{lightness:-18},{visibility:'on'}]},{featureType:'road.highway',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-92},{lightness:60},{visibility:'on'}]},{featureType:'poi',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-81},{lightness:34},{visibility:'on'}]},{featureType:'road.arterial',elementType:'all',stylers:[{hue:'#dddbd7'},{saturation:-92},{lightness:37},{visibility:'on'}]},{featureType:'transit',elementType:'geometry',stylers:[{hue:'#c8c6c3'},{saturation:4},{lightness:10},{visibility:'on'}]}]

