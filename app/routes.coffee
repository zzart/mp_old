module.exports = (match) ->
    match '',                           'home#show'
    # match 'oferty/:typ',                'offer-list#show'
    # match 'oferty/:typ/:transakcja',    'offer-list#show'
    # match 'dodaj_oferte',               'add-offer#show'
    match 'klienci/dodaj',              'client#add'
    match 'klienci',                    'client#list'
    match 'klienci/:id',                'client#show'
    match 'klienci-wspolni',            'client-public#list'
    match 'klienci-wspolni/:id',        'client-public#show'
    # match 'klienci/:typ/:filter',       'client-list#show'
    match 'login',                       'login#show'
    match 'biura/:id',                   'bon#show'
    match 'oddzialy/dodaj',              'branch#add'
    match 'oddzialy',                    'branch#list'
    match 'oddzialy/:id',                'branch#show'
    match 'agenci/dodaj',                'agent#add'
    match 'agenci',                      'agent#list'
    match 'agenci/:id',                  'agent#show'
    match 'oferty/dodaj',                'listing#add'
    match 'oferty',                      'listing#list'
    match 'oferty/:id',                  'listing#show'
    match 'iframe/:template',            'iframe#show'
    match 'grafiki',                     'graphic#list'
    match 'grafiki/dodaj',               'graphic#add'
    match 'grafiki/:id',                 'graphic#show'
