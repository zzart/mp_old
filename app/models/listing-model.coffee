module.exports = class Listing extends Chaplin.Model
    urlRoot: 'http://localhost:8080/v1/oferty'
    schema: {}
    file_to_string: ->
        'test function'

    readFile: (file) ->
        reader = new FileReader()
        self = @
        # closure to capture the file information.
        reader.onload = ((theFile, self) ->
            (e) ->
                #set model
                self.set
                    filename: theFile.name
                    data: e.target.result
        )(file, @)
        # Read in the image file as a data URL.
        reader.readAsDataURL file
