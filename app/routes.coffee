module.exports = (match) ->
    match '',                           'home#show'
    # match 'oferty/:typ',                'offer-list#show'
    # match 'oferty/:typ/:transakcja',    'offer-list#show'
    # match 'dodaj_oferte',               'add-offer#show'
    match 'klienci/dodaj',              'client#add'
    match 'klienci',                    'client#list'
    match 'klienci/:id',               'client#show'
    # match 'klienci/:typ/:filter',       'client-list#show'
    match 'login',                      'login#show'
