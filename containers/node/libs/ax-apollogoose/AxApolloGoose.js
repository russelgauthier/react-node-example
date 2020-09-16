let path = require("path")
let fs = require("fs")
const { gql } = require('apollo-server')

const { GqlSDL, GqlObjectType, GqlWrappingTypeNonNullable, GqlWrappingTypeOptional} = require("../ax-apollogoose-sdl")

const AxApolloGooseMongooseReader = require("./AxApolloGooseMongooseReader")
const AxApolloGooseTypeDefsReader = require("./AxApolloGooseTypeDefsReader")
const AxApolloGooseMongoPredicatesReader = require("./AxApolloGooseMongoPredicatesReader")
const AxApolloGooseMongoProjections = require("./AxApolloGooseMongoProjections")
const AxApolloGooseException = require("./AxApolloGooseException")

class AxApolloGoose {
    #typeDefs
    #gqlSDL
    constructor(mongooseModels=[]){
        this.#gqlSDL = new GqlSDL()

        if(mongooseModels !== undefined && !Array.isArray(mongooseModels)){
            throw new TypeError("AxApolloGoose constructor either has no arguments, or has to provide an array of mongoose models to add")
        }

        //Adding static predicates
        const fileLocation = path.join(__dirname, "StaticPredicates.graphql")
        let graphqlStaticPredicatesString = ""

        try {
            graphqlStaticPredicatesString = fs.readFileSync(fileLocation, "utf8")
        } catch(e){
            throw new AxApolloGooseException(`Error while trying to read static predicates file: ${fileLocation}`)
        }

        this.addTypedefs(gql`${graphqlStaticPredicatesString}`)


        //Adding models
        if(Array.isArray(mongooseModels)){
            this.addModels(mongooseModels)
        }

        //Converting GqlSDL model to gql typeDefs
        this.#typeDefs = gql(`${this}`)
    }
    addModels(mongooseModels){
        AxApolloGooseMongooseReader.addModels(mongooseModels, this.#gqlSDL)
    }
    addTypedefs(gqlTypeDef){
        AxApolloGooseTypeDefsReader.addTypedefs(gqlTypeDef, this.#gqlSDL)

        //Updating typeDefs
        this.#typeDefs = gql(`${this}`)
    }
    getContext(middleware){
        return async ({req, res}) => {
            try {
                return {_headers: req.headers, _middleware: middleware, _res: res, _req: req}
            } catch(e){
                throw e
            }
        }
    }
    getPredicates(args = {}){
        return AxApolloGooseMongoPredicatesReader.read(args)
    }
    getProjections(info = {}){
        return AxApolloGooseMongoProjections.get(info, this.#gqlSDL)
    }
    getResolverMap(){
        return this.#gqlSDL.getResolverMap()
    }
    getResolverMapMerged(resolverMap = {}, overrideInner = true){
        //Adding support for middleware
        ["Mutation", "Query", "Subscription"].forEach(operationType => {
            for(let operation in resolverMap[operationType]){
                let currOperationFnc = resolverMap[operationType][operation]

                resolverMap[operationType][operation] = (() => async (parent, args, ctx, info) => {
                    if(ctx?._middleware !== "undefined"){
                        let middleware = ctx._middleware?.[operationType]?.[info?.fieldName]
                        if(typeof(middleware) === "function"){
                            await middleware(parent, args, ctx, info)
                        }
                    }

                    return currOperationFnc(parent, args, ctx, info)
                })()
            }
        })

        let resolverMapMerged = this.#gqlSDL.getResolverMapMerged(resolverMap, true)

        //Adding resolvers for types that are called in Mutation, Query & Subscription. For more info go to: https://github.com/russelgauthier/ax-paas/issues/106
        let types = [
            this.#gqlSDL.types?.Mutation?.selectionSet,
            this.#gqlSDL.types?.Query?.selectionSet,
            this.#gqlSDL.types?.Subscription?.selectionSet
        ]
        for(let selectionSet of types){
            Object.values(selectionSet).forEach(typeValue => {
                let gqlType = typeValue.outputType.gqlType
                if(gqlType instanceof GqlObjectType){
                    if(!resolverMapMerged?.[gqlType.name]){
                        resolverMapMerged[gqlType.name] = {}
                    }
                    gqlType.fields.filter(field => field.constructor.name === "AxApolloGooseGqlField" && field.refTo !== null && field.refField !== null).forEach(field => {
                        if(!resolverMapMerged[gqlType.name]?.[field.name]){

                            //Assigning resolver to field within GQLObjectType
                            resolverMapMerged[gqlType.name][field.name] = (
                                (field, apollogoose) => async(parent, args, ctx, info) => {
                                    if([GqlWrappingTypeNonNullable, GqlWrappingTypeOptional].some(wrappingType => field.type instanceof wrappingType)){
                                        return await field.refModel.findOne({_id: parent[field.refField]}, apollogoose.getProjections(info)).lean()
                                    } else { //A list
                                        return await field.refModel.find({_id: {$in: parent[field.refField]}}, apollogoose.getProjections(info)).lean()
                                    }
                                }
                            )(field, this)
                        }
                    })
                }
            })
        }

        return resolverMapMerged
    }
    get typeDefs(){
        return this.#typeDefs
    }
    toJSON(){
        return this.#gqlSDL.toJSON()
    }
    toString(){
        return this.#gqlSDL.toString()
    }
}

module.exports = AxApolloGoose