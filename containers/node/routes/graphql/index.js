const path = require("path")
global.rootPath = path.join(__dirname, "../..")

const { gql } = require('apollo-server')

const { Station } = require(path.join(global.rootPath, "models/"))

const AxApolloGoose = require("../../libs/ax-apollogoose")

let apollogoose = new AxApolloGoose([
    Station
])

apollogoose.addTypedefs(gql`    
    type Query {
        stations: [Station!]!
        stationById(_id: ID!): Station
    }
`)

// Provide resolver functions for your schema fields
const resolvers = apollogoose.getResolverMapMerged({
    Query: {
        stations: async(_, __, ___, info) => {
            return Station.find({}, apollogoose.getProjections(info)).lean()
        },
        stationById: async(_, args, ctx, info) => {
            return await Station.findOne({_id: args._id}, apollogoose.getProjections(info)).lean()
        }
    }
})

const subscriptions = {}
const middleware = {}

module.exports = { gqlTypeDefs: apollogoose.typeDefs, gqlResolvers: resolvers, gqlSubscriptions: subscriptions, gqlContext: apollogoose.getContext(middleware) }
