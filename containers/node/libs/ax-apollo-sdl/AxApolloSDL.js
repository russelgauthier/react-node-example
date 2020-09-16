const AxApolloCustomScalarType = require("./AxApolloCustomScalarType")
const AxApolloEnumType = require("./AxApolloEnumType")
const AxApolloMutationType = require("./AxApolloMutationType")
const AxApolloQueryType = require("./AxApolloQueryType")
const AxApolloSubscriptionType = require("./AxApolloSubscriptionType")
const AxApolloUnionType = require("./AxApolloUnionType")

const { GqlScalarType, GqlMutationType, GqlQueryType, GqlSubscriptionType, GqlUnionType, GqlSDL, GqlOperationType} = require("./../ax-apollo-sdl")

class AxApolloSDL extends GqlSDL {
    constructor(){
        super()

        delete this.types["Mutation"]
        delete this.types["Query"]
        delete this.types["Subscription"]

        this.addType(new AxApolloMutationType())
        this.addType(new AxApolloQueryType())
        this.addType(new AxApolloSubscriptionType())
    }
    addCustomScalarType(gqlCustomScalarType){
        if(![AxApolloCustomScalarType, GqlScalarType].some(gqlType => gqlCustomScalarType instanceof gqlType)){
            throw new TypeError(`Can only add valid AxApolloCustomScalarType through AxApolloSDL->addCustomScalarType`)
        }

        return this.addType(gqlCustomScalarType)
    }
    addCustomScalarTypeByParams(name, description, parseValueFnc, serializeFnc, parseLiteralFnc){
        return this.addType(new AxApolloCustomScalarType(name, description, parseValueFnc, serializeFnc, parseLiteralFnc))
    }
    addEnumTypeByParams(name, optionKeys, optionValues){
        return this.addType(new AxApolloEnumType(name, optionKeys, optionValues))
    }
    addMutationType(mutationType){
        if(![GqlMutationType, AxApolloMutationType].some(gqlType => mutationType instanceof gqlType)){
            throw new TypeError('Can only add selectionSets from GqlMutationType')
        }

        return this.addMutationTypeSelections(Object.values(mutationType.selectionSet))
    }
    addMutationTypeSelectionByParams(name, outputType, args, resolverFnc){
        return this.getType("Mutation").addSelectionByParams(name, outputType, args, resolverFnc)
    }
    addQueryType(queryType){
        if(![GqlQueryType, AxApolloQueryType].some(gqlType => queryType instanceof gqlType)){
            throw new TypeError('Can only add selectionSets from GqlQueryType')
        }

        return this.addQueryTypeSelections(Object.values(queryType.selectionSet))
    }
    addQueryTypeSelectionByParams(name, outputType, args, resolverFnc){
        return this.getType("Query").addSelectionByParams(name, outputType, args, resolverFnc)
    }
    addSubscriptionType(subscriptionType){
        if(![GqlSubscriptionType, AxApolloSubscriptionType].some(gqlType => subscriptionType instanceof gqlType)){
            throw new TypeError('Can only add selectionSets from GqlSubscriptionType')
        }

        return this.addSubscriptionTypeSelections(Object.values(subscriptionType.selectionSet))
    }
    addSubscriptionTypeSelectionByParams(name, outputType, args, resolverFnc){
        return this.getType("Subscription").addSelectionByParams(name, outputType, args, resolverFnc)
    }
    addUnionType(unionType){
        if(![AxApolloUnionType, GqlUnionType].some(gqlType => unionType instanceof gqlType)){
            throw new TypeError(`Can only add valid GqlUnionType through AxApolloSDL->addUnionType`)
        }

        return this.addType(unionType)
    }
    addUnionTypeByParams(name, gqlObjectTypes, resolverFnc){
        return this.addType(new AxApolloUnionType(name, gqlObjectTypes, resolverFnc))
    }
    getCustomScalarTypeResolverMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloCustomScalarType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    getEnumTypeResolverMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloEnumType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    getMutationTypeResolverMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloMutationType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    getQueryTypeResolverMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloQueryType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    getResolverMap(){
        let result = {}

        let gqlTypesWithResolvers = [AxApolloMutationType, AxApolloQueryType, AxApolloSubscriptionType, AxApolloCustomScalarType, AxApolloEnumType, AxApolloUnionType]

        Object.values(this.types).filter(type => gqlTypesWithResolvers.some(gqlType => type instanceof gqlType))
            .forEach(type => result = {...result, ...type.getResolverMap()});

        //Removing empty operation types: Operation types must have at least 1 selection as per spec
        ["Mutation", "Query", "Subscription"].forEach(operationType => {
            if(result[operationType] !== undefined){
                if(!Object.keys(result[operationType]).length){
                    delete result[operationType]
                }
            }
        })

        return result
    }
    getResolverMapMerged(resolverMap = {}, overrideInner = true){
        let result = {}

        if(typeof(resolverMap) !== "object" || Array.isArray(resolverMap)){
            throw new TypeError("Merging resolverMaps requires a valid Object, or can be undefined")
        }
        if(typeof(overrideInner) !== "boolean"){
            throw new TypeError("OverrideInner for getResolverMapMerged must be a boolean")
        }

        let resolverMapInner = this.getResolverMap()

        result = overrideInner ? {...resolverMapInner, ...resolverMap} : {...resolverMap, ...resolverMapInner}

        if((resolverMap["Query"] !== undefined || resolverMapInner["Query"] !== undefined) && Object.keys(resolverMap["Query"]).length){
            result["Query"] = overrideInner ? {...resolverMapInner["Query"], ...resolverMap["Query"]} : {...resolverMap["Query"], ...resolverMapInner["Query"]}
        }
        if((resolverMap["Mutation"] !== undefined || resolverMapInner["Mutation"] !== undefined) && Object.keys(resolverMap["Mutation"]).length){
            result["Mutation"] = overrideInner ? {...resolverMapInner["Mutation"], ...resolverMap["Mutation"]} : {...resolverMap["Mutation"], ...resolverMapInner["Mutation"]}
        }
        if((resolverMap["Subscription"] !== undefined || resolverMapInner["Subscription"] !== undefined) && Object.keys(resolverMap["Subscription"]).length){
            result["Subscription"] = overrideInner ? {...resolverMapInner["Subscription"], ...resolverMap["Subscription"]} : {...resolverMap["Subscription"], ...resolverMapInner["Subscription"]}
        }

        return result
    }
    getSubscriptionTypeResolverMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloSubscriptionType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    getUnionTypeResolveMap(){
        let result = {}

        Object.values(this.types).filter(type => type instanceof AxApolloUnionType).forEach(type => result = {...result, ...type.getResolverMap()})

        return result
    }
    static mergeGqlSDLs(gqlSDLs, ignoreDuplicates=true, duplicatesDeleteInner=true){
        if(!Array.isArray(gqlSDLs)){
            throw new TypeError('GqlSDL.mergeGqlSDLs gqlSDLs must be an array of GqlSDL')
        }
        gqlSDLs.forEach(gqlSDL => {
            if(!(gqlSDL instanceof GqlSDL)){
                throw new TypeError('GqlSDL.mergeGqlSDLs gqlSDLs must be an array of GqlSDL')
            }
        })

        let gqlSDLResult = new AxApolloSDL()

        gqlSDLs.forEach(gqlSDL => {
            gqlSDLResult.mergeGqlSDL(gqlSDL)
        })

        return gqlSDLResult
    }
    toString(){
        let outputObjectTypes = [AxApolloMutationType, AxApolloQueryType, AxApolloSubscriptionType]

        let result = Object.values(this.types).filter(gqlType =>
            outputObjectTypes.some(outputType => gqlType instanceof outputType)
            && (!(gqlType instanceof GqlOperationType) || Object.keys(gqlType.selectionSet).length)
        ).join('\n')

        return result + (result.length ? "\n" : "") + super.toString()
    }
}

module.exports = {
    AxApolloSDL,
    AxApolloCustomScalarType,
    AxApolloMutationType, AxApolloQueryType, AxApolloSubscriptionType,
    AxApolloUnionType
}