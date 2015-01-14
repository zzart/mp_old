describe 'Array', ->
    describe '#indexOf()', ->
        it 'should pass', ->
            assert.equal(-1, [1,2,3].indexOf(4))

describe 'index page', ->
    it 'shows the index', ->
        visit("/").then ->
            find('h1').text().should.equal("Ember!")
            # expect(find('h1').text()).to.equal("Ember!")
