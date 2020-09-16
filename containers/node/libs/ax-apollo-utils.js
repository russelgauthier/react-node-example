class AxApolloUtils {
    #typeDefs
    #mongoPredicateTypes

    /*
    *
    * @param typeDefs: {!Object} - The type definitions created by ApolloGraphQL using gql template literal
    * @param mongoPredicateTypes: {!Array<string>} - List of mongoPredicate / custom objects to put $ in front of all key names
    *
     */
    constructor(typeDefs, mongoPredicateTypes){
        this.#typeDefs = typeDefs
        this.#mongoPredicateTypes = mongoPredicateTypes
    }

    /*
    *
    * Goes through all args passed to resolver and reformats the ones that are defined Mongo predicate types to include $ in their operators
    *
    * @param info: {!Object} - Info field provided by Apollo resolvers(4th argument)
    * @param args: {!Object} - Args provided by Apollo resolvers(3rd argument)
    *
    * @return {!Object} - {lt: 3, gt:1} -> {$lt: 3, $gt: 1}
    *
     */
    getMongoPredicates(info = {}, args = {}){
        let mongoPredicatesArgs = {}
        let typeName = info.fieldName

        args = typeof(args) === "object" && !Array.isArray(args) ? args : {}

        const mongoPredicateTypes = this.#mongoPredicateTypes
        const gqlScalarTypes = ["Int", "Float", "String", "Boolean", "ID"]

        let _typeDefs = (typeof(typeDefs) === "undefined" || !Array.isArray(this.#typeDefs.definitions)) ? {definitions: []} : this.#typeDefs

        function findTypeInfo(type){
            if(gqlScalarTypes.some(gqlScalarType => type === gqlScalarType)){
                return []
            }

            let argsTree =  _typeDefs.definitions.filter(definition => definition.kind === "InputObjectTypeDefinition" && definition.name?.value === type)?.[0]

            argsTree = getBranchTypeInfoRecursive(argsTree.fields)

            return argsTree
        }
        function getBranchTypeInfoRecursive(inputDefs){
            let argsTypeTree = Array.isArray(inputDefs) && inputDefs.map(inputDef => {
                let argumentInfo = {name: inputDef.name?.value, type: inputDef.type?.type?.name?.value ?? inputDef.type?.name?.value}

                if(!mongoPredicateTypes.some(mongoPredicateType => argumentInfo.type === mongoPredicateType)){
                    argumentInfo.children = {}
                }

                return argumentInfo
            }) || []

            argsTypeTree.filter(argBranch => argBranch.children).forEach(branch => {
                branch.children = findTypeInfo(branch.type)
            })

            return argsTypeTree
        }

        //
        // Getting argument tree for MongoPredicates
        //
        let argsTypeTree = _typeDefs.definitions.filter(definition => definition.kind === "ObjectTypeDefinition" && definition.name?.value === "Query")
            .map(definition => definition.fields).flat().filter(field => field.name?.value === typeName)
            .map(field => field.arguments).flat().filter(argument => argument.kind === "InputValueDefinition")
        argsTypeTree = getBranchTypeInfoRecursive(argsTypeTree)

        //
        // Fixing MongoDB operators from lt => $lt, gt => $gt, etc
        // GraphQL doesn't support names with a $ in them: https://spec.graphql.org/June2018/#sec-Names
        //
        prefixMongoOperatorsRecursive(args, argsTypeTree, mongoPredicatesArgs)

        function prefixMongoOperatorsRecursive(currArgs, argsTypeBranch, mongoPredicatesArgs){
            for(let argKey in currArgs){
                let argBranch = currArgs[argKey]
                mongoPredicatesArgs[argKey] = {}

                let mongoPredicateLeaf = argsTypeBranch.filter(mongoPredicateLeaf => mongoPredicateLeaf.name === argKey)?.[0]
                if(mongoPredicateLeaf){
                    if(!mongoPredicateLeaf.children){
                        if(mongoPredicateTypes.some(mongoPredicateType => mongoPredicateType === mongoPredicateLeaf.type)) {
                            Object.keys(argBranch).forEach(mongoOperator => {
                                mongoPredicatesArgs[argKey][`$${mongoOperator}`] = currArgs[argKey][mongoOperator]
                            })
                        }
                    } else {
                        if(!gqlScalarTypes.some(gqlScalarType => mongoPredicateLeaf.type === gqlScalarType)) {
                            prefixMongoOperatorsRecursive(argBranch, mongoPredicateLeaf.children, mongoPredicatesArgs[argKey])
                        } else {
                            mongoPredicatesArgs[argKey] = currArgs[argKey]
                        }
                    }
                }
            }
        }

        return mongoPredicatesArgs
    }

    /*
    *
    * Gets list of fields to project for MongoDB, instead of all fields(default)
    *
    * @param info: {!Object} - Info field provided by Apollo resolvers(4th argument)
    *
    * @return {!Array<string>} - ["Field1", "Field2", "Field3", ...]
     */
    getProjections(info = {}){
        let fieldsFilter = Array.isArray(info.fieldNodes) && info.fieldNodes.filter(fieldNode => fieldNode.name?.value === info.fieldName && typeof(info.fieldName) !== "undefined")?.[0]
            .selectionSet?.selections || []

        fieldsFilter = fieldsFilter.filter(selection => selection.kind === "Field")
            .map(selection => selection.name)
            .filter(selection => selection.kind === "Name").map(selection => selection.value).filter(selection => typeof selection === "string")

        return fieldsFilter
    }

    /*
    *
    * Gets list of fields to project for MongoDB, instead of all fields(default)
    *
    * @param info: {!Object} - Info field provided by Apollo resolvers(4th argument)
    *
    * @return {!Array<string, boolean>} - e.g. {fieldA: true, fieldB: true}, doesn't put false for ones that aren't queried for
    *
     */
    getMongoProjections(info = {}){
        let result = {}

        //Setting up result object
        this.getProjections(info).forEach(field => result[field] = true)

        return result
    }
}

module.exports = AxApolloUtils