const { ApolloServer, gql } = require('apollo-server')
const Decimal128 = require("mongodb").Decimal128
const Int32 = require("mongodb").Int32
const Long = require("mongodb").Long

console.clear()

//TODO: Put the typedefs, resolves, subscriptions & context in separate files

const path = require("path")
global.rootPath = path.join(__dirname, "../..")

const {CompanyFlat} = require("../services/ax-apollo/testschemas/companyflat")

const AxApolloGraphqlUtils = require("../../libs/ax-apollo-utils")
const AxApolloGoose = require("../../libs/ax-apollogoose")

let apollogoose = new AxApolloGoose([
    CompanyFlat
])

const typeDefs = gql`
    type Query {
        ### Test Schemas ###
        companyflat: CompanyFlat
        companyflats(_id:String): [CompanyFlat]

        ### Buffer Tests ###
        typeTestBufferOutputMongoose: String!
        typeTestBufferOutputMongooseNull: String
        typeTestBufferOutputMongooseNullable: String
        typeTestBufferRelayMongoose(inpt:String!): String!
        typeTestBufferRelayMongooseNull(inpt:String): String
        typeTestBufferRelayMongooseNullable(inpt:String): String

        ### Date Tests ###
        typeTestDateInput(inpt:Date!):String
        typeTestDateOutput: Date
        typeTestDateOutputFromLiteral: Date
        typeTestDateOutputMongoose: Date
        typeTestDateOutputMongooseNull: Date
        typeTestDateOutputMongooseNullable: Date
        typeTestDateOutputNull: Date
        typeTestDateRelay(inpt:Date): Date
        typeTestDateRelayMongoose(inpt:Date!): Date!
        typeTestDateRelayMongooseNullable(inpt:Date): Date

        ### Decimal Tests ###
        typeTestDecimal128Input(inpt:Decimal128!):String
        typeTestDecimal128Output: Decimal128
        typeTestDecimal128OutputBigInt: Decimal128
        typeTestDecimal128OutputFromLiteral: Decimal128
        typeTestDecimal128OutputMongoose: Decimal128!
        typeTestDecimal128OutputMongooseNull: Decimal128
        typeTestDecimal128OutputMongooseNullable: Decimal128
        typeTestDecimal128OutputNull: Date
        typeTestDecimal128Relay(inpt:Decimal128): Decimal128
        typeTestDecimal128RelayMongoose(inpt:Decimal128!): Decimal128!
        typeTestDecimal128RelayMongooseNullable(inpt:Decimal128): Decimal128

        ### Int32 Tests ###
        typeTestInt32Input(inpt:Int32!):String
        typeTestInt32Output: Int32
        typeTestInt32OutputFromLiteral: Int32
        typeTestInt32OutputMongoose: Int32!
        typeTestInt32OutputMongooseNull: Int32
        typeTestInt32OutputMongooseNullable: Int32
        typeTestInt32OutputNull: Int32
        typeTestInt32Relay(inpt:Int32): Int32
        typeTestInt32RelayMongoose(inpt:Int32!): Int32!
        typeTestInt32RelayMongooseNullable(inpt:Int32): Int32

        ### JSON Tests ###
        typeTestJSONInput(inpt:JSON!):String
        typeTestJSONOutput: JSON
        typeTestJSONOutputFromLiteral: JSON
        typeTestJSONOutputMongoose: JSON!
        typeTestJSONOutputMongooseNull: JSON
        typeTestJSONOutputMongooseNullable: JSON
        typeTestJSONOutputNull: JSON
        typeTestJSONRelay(inpt:JSON): JSON
        typeTestJSONRelayMongoose(inpt:JSON!): JSON!
        typeTestJSONRelayMongooseNullable(inpt:JSON): JSON

        ### Long Tests ###
        typeTestLongInput(inpt:Long!):String
        typeTestLongOutput: Long
        typeTestLongOutputBigInt: Long
        typeTestLongOutputFromLiteral: Long
        typeTestLongOutputMongoose: Long!
        typeTestLongOutputMongooseNull: Long
        typeTestLongOutputMongooseNullable: Long
        typeTestLongOutputNull: Long
        typeTestLongRelay(inpt:Long): Long
        typeTestLongRelayMongoose(inpt:Long!): Long!
        typeTestLongRelayMongooseNullable(inpt:Long): Long

        ### Map Tests ###
        typeTestMapInput(inpt:Map!):String
        typeTestMapOutput: Map
        typeTestMapOutputFromLiteral: Map
        typeTestMapOutputMongoose: Map!
        typeTestMapOutputMongooseNull: Map
        typeTestMapOutputMongooseNullable: Map
        typeTestMapOutputNull: Map
        typeTestMapRelay(inpt:Map): Map
        typeTestMapRelayMongoose(inpt:Map!): Map!
        typeTestMapRelayMongooseNullable(inpt:Map): Map
    }

    ${apollogoose}
`

let axApolloGraphqlUtils = new AxApolloGraphqlUtils(typeDefs, ["MongoStringPredicate", "MongoIntPredicate"])
console.clear()
// Provide resolver functions for your schema fields
const resolvers = apollogoose.getResolverMapMerged({
    Query: {
        companyflats: async(parent, args, context, info) => {
            args = axApolloGraphqlUtils.getMongoPredicates(info, args)

            return CompanyFlat.find(args.predicates, axApolloGraphqlUtils.getMongoProjections(info, typeDefs)).lean()
        },
        companyflat: async(_, __, ___, info) => {
            return CompanyFlat.findOne({}, axApolloGraphqlUtils.getMongoProjections(info, typeDefs)).lean()
        },
        typeTestBufferOutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestBuffer
        },
        typeTestBufferOutputMongooseNull: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestBufferNull
        },
        typeTestBufferOutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestBufferNullable
        },
        typeTestBufferRelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestBuffer:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestBuffer
        },
        typeTestBufferRelayMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestBufferNull:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestBufferNull
        },
        typeTestDateInput: async(_, args) => {
            console.log("Query: typeTestDateInput", args.inpt)

            return "Query: typeTestDateInput value(no output) - console output only"
        },
        typeTestDateOutput: async() => {
            return Date.now()
        },
        typeTestDateOutputFromLiteral: async() => {
            return new Date(324234234324)
        },
        typeTestDateOutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDate
        },
        typeTestDateOutputMongooseNull: async(_, args) => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDateNull
        },
        typeTestDateOutputMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDateNullable
        },
        typeTestDateOutputNull: async() => {
            return null
        },
        typeTestDateRelay: async(_, args) => {
            return args.inpt
        },
        typeTestDateRelayMongoose: async(_, args, __, ___) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestDate:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestDate
        },
        typeTestDateRelayMongooseNullable: async(_, args, __, ___) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestDateNull:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestDateNull
        },
        typeTestDecimal128Input: async(_, args) => {
            console.log("Query: typeTestDecimal128Input", args.inpt)

            return "Query: typeTestDecimal128Input value(no output) - console output only"
        },
        typeTestDecimal128Output: async() => {
            return 213.333
        },
        typeTestDecimal128OutputBigInt: async() => {
            return 2333333333333333333333333333n
        },
        typeTestDecimal128OutputFromLiteral: async() => {
            return Decimal128.fromString("123123.3E9")
        },
        typeTestDecimal128OutputMongoose: async(_, __, ___, info) => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDecimal128
        },
        typeTestDecimal128OutputMongooseNull: async(_, __, ___, info) => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDecimal128Null
        },
        typeTestDecimal128OutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestDecimal128Nullable
        },
        typeTestDecimal128OutputNull: async() => {
            return null
        },
        typeTestDecimal128Relay: async(_, args) => {
            return args.inpt
        },
        typeTestDecimal128RelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestDecimal128:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestDecimal128
        },
        typeTestDecimal128RelayMongooseNullable: async(_, args, __, ___) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestDecimal128Null:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestDecimal128Null
        },
        typeTestInt32Input: async(_, args) => {
            console.log("Query: typeTestInt32Input", args.inpt)

            return "Query: typeTestInt32Input value(no output) - console output only"
        },
        typeTestInt32Output: async() => {
            return 213
        },
        typeTestInt32OutputFromLiteral: async() => {
            return new Int32(324234234324)
        },
        typeTestInt32OutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestInt32
        },
        typeTestInt32OutputMongooseNull: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestInt32Null
        },
        typeTestInt32OutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestInt32Nullable
        },
        typeTestInt32OutputNull: async() => {
            return null
        },
        typeTestInt32Relay: async(_, args) => {
            return args.inpt
        },
        typeTestInt32RelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestInt32:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestInt32
        },
        typeTestInt32RelayMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestInt32Null:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestInt32Null
        },
        typeTestJSONInput: async(_, args) => {
            console.log("Query: typeTestJSONInput", args.inpt)
            return "Query: typeTestJSONInput value(no output) - console output only"
        },
        typeTestJSONOutput: async() => {
            return `{"a":3333,"b":4444,"c":{"a":99,"b":324324324}}`
        },
        typeTestJSONOutputFromLiteral: async() => {
            return `{"a":324234234324,"b":9329}`
        },
        typeTestJSONOutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMixed
        },
        typeTestJSONOutputMongooseNull: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMixedNull
        },
        typeTestJSONOutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMixedNullable
        },
        typeTestJSONOutputNull: async() => {
            return null
        },
        typeTestJSONRelay: async(_, args) => {
            return args.inpt
        },
        typeTestJSONRelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestMixed:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestMixed
        },
        typeTestJSONRelayMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestMixedNull:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestMixedNull
        },
        typeTestLongInput: async(_, args) => {
            console.log("Query: typeTestLongInput", args.inpt)

            return "Query: typeTestLongInput value(no output) - console output only"
        },
        typeTestLongOutput: async() => {
            return 213
        },
        typeTestLongOutputBigInt: async() => {
            return 324234234n
        },
        typeTestLongOutputFromLiteral: async() => {
            return new Long(324234234324)
        },
        typeTestLongOutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestLong
        },
        typeTestLongOutputMongooseNull: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestLongNull
        },
        typeTestLongOutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestLongNullable
        },
        typeTestLongOutputNull: async() => {
            return null
        },
        typeTestLongRelay: async(_, args) => {
            return args.inpt
        },
        typeTestLongRelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestLong:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestLong
        },
        typeTestLongRelayMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestLongNull:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestLongNull
        },
        typeTestMapInput: async(_, args) => {
            console.log("Query: typeTestMapInput", args.inpt)

            return "Query: typeTestMapInput value(no output) - console output only"
        },
        typeTestMapOutput: async() => {
            return {a:333,b:999}
        },
        typeTestMapOutputFromLiteral: async() => {
            return (new Map()).set("A", 333)
        },
        typeTestMapOutputMongoose: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMap
        },
        typeTestMapOutputMongooseNull: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMapNull
        },
        typeTestMapOutputMongooseNullable: async() => {
            let companyFlat = await CompanyFlat.findOne({}).lean()

            return companyFlat.typeTestMapNullable
        },
        typeTestMapOutputNull: async() => {
            return null
        },
        typeTestMapRelay: async(_, args) => {
            return args.inpt
        },
        typeTestMapRelayMongoose: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestMap:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestMap
        },
        typeTestMapRelayMongooseNullable: async(_, args) => {
            let companyFlat = await CompanyFlat.findOneAndUpdate({},{$set:{typeTestMapNull:args.inpt}},{new: true, runValidators: true}).lean()

            return companyFlat.typeTestMapNull
        }
    }
})

const subscriptions = {}

//Context can come from the top level file & will contain authentication & authorization middleware
const context = {}


module.exports = { gqlTypeDefs: typeDefs, gqlResolvers: resolvers, gqlSubscriptions: subscriptions, gqlContext: context }
