#!/bin/bash
#echo "changed settings ?"
#read ok
cd /home/mars/www/mp
sed -i 's/online = false/online = true/' app/application.coffee
sed -i 's/mobile = false/mobile = true/' app/application.coffee
npm run build
rsync -v -e ssh public/javascripts/app.js mars@cash:/home/mars/dev/www/mp/javascripts/app.js
rsync -v -e ssh public/stylesheets/app.css mars@cash:/home/mars/dev/www/mp/stylesheets/app.css
sed -i 's/online = true/online = false/' app/application.coffee
sed -i 's/mobile = true/mobile = false/' app/application.coffee
echo "done"
