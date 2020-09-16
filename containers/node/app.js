//const debug = require('debug')('dev') //TODO: test
const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const errorHandler = require('express-json-errors')

const path = require('path')
const bodyParser = require('body-parser')
const favicon = require("serve-favicon")
const puggo = require("pug")
const compileSass = require("express-compile-sass")
const {env} = require("./config/config")

const {mongoose} = require("./config/mongoose")

//GraphQL Apollo Server
const { ApolloServer } = require('apollo-server-express')
const { gqlTypeDefs, gqlResolvers, gqlSubscriptions, gqlContext} = require("./routes/graphql/index")

global.rootPath = __dirname

//Express setup
let app = express()

//Setting up middleware
app.use(errorHandler())
app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(compileSass({
    root: path.join(__dirname, 'views/assets/css'),
    sourceMap: true,
    sourceComments: true,
    watchFiles: true,
    logToConsole: true
}))

app.use('/assets', express.static(path.join(__dirname, '/views/assets')))
app.use(favicon(path.join(__dirname, 'views/assets/img', 'favicon.ico')))

//View Engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')


//Starting GraphQL server — /graphql
const graphqlServer = new ApolloServer({ typeDefs: gqlTypeDefs, resolvers: gqlResolvers, subscriptions: gqlSubscriptions, context: gqlContext,  })
graphqlServer.applyMiddleware({app, path: '/graphql'})

//Doing all non-GraphQL routing in the routes/ dir
app.use('/', require('./routes/index'))


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found')

  err.status = 404
  next(err)
})

//Error handler (only renders info in development)
app.use(function(err, req, res, next){
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  //render the error page
  res.status(err.status || 500)
  res.render('error')
})




module.exports = {app}
