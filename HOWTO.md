# How to...

## Heroku

- visit live app root : `heroku open`

- see logs : `heroku logs --tail`

- start local : `heroku local web` (http://localhost:5000), or `heroku local`

- add dependency : `npm install cool-ascii-faces`

- start console : `heroku run bash`

- interact with the heroku-postgres addon : https://devcenter.heroku.com/articles/heroku-postgresql

- troubleshot :
    * https://devcenter.heroku.com/articles/troubleshooting-node-deploys
    * https://devcenter.heroku.com/articles/node-memory-use

### Sources

- https://devcenter.heroku.com/articles/getting-started-with-nodejs

### Expressjs

- transfer files to user : https://github.com/expressjs/express/tree/master/examples/downloads

- error :
    * pages : https://github.com/expressjs/express/tree/master/examples/error-pages
    * https://github.com/expressjs/express/blob/master/examples/error

- webservice API : https://github.com/expressjs/express/tree/master/examples/web-service

- views :
    * https://github.com/expressjs/express/tree/master/examples/view-constructor
    * https://github.com/expressjs/express/tree/master/examples/view-locals
    * https://github.com/expressjs/express/tree/master/examples/ejs

- routes :
    * [](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes)
    * [](https://github.com/expressjs/express/tree/master/examples/params)
    * [](https://github.com/expressjs/express/tree/master/examples/resource)
    * [](https://github.com/expressjs/express/tree/master/examples/route-map)
    * [](https://github.com/expressjs/express/tree/master/examples/route-middleware)
    * [](https://github.com/expressjs/express/tree/master/examples/route-separation)
    
- sessions : https://github.com/expressjs/express/tree/master/examples/session

- forms : https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/forms
    
#### sources

- https://expressjs.com/en/starter/examples.html
- https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs

## Monitor

- auth : https://manage.auth0.com/dashboard/eu/tight-sun-4633/
- errors : https://sentry.io/organizations/xtech-42634/issues/?project=5651105
- live testing : https://live.browserstack.com/dashboard
- speed :
  - https://www.browserstack.com/speedlab
  - https://developers.google.com/speed
- responsive : https://www.browserstack.com/responsive
- size : https://www.webbloatscore.com/
- logs : https://my.papertrailapp.com/systems/xtech-42634/events
- various :
  - https://web.dev/measure/
  - `lighthouse https://xtech-42634.herokuapp.com/`

