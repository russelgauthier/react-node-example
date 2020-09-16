const AxApolloGooseMongoPredicatesReaderException = require("./AxApolloGooseMongoPredicatesReaderException")

class AxApolloGooseMongoPredicatesReader {
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
    static read(args = {}){
        let mongoPredicatesArgs = {}

        args = typeof(args) === "object" && !Array.isArray(args) ? args : {}

        prefixPredicates(args, mongoPredicatesArgs)

        //
        // Fixing MongoDB operators from lt => $lt, gt => $gt, etc
        // GraphQL doesn't support names with a $ in them: https://spec.graphql.org/June2018/#sec-Names
        //
        function prefixPredicates(currArgs, mongoPredicatesArgs){
            for(let argKey in currArgs){
                let argBranch = currArgs[argKey]
                mongoPredicatesArgs[argKey] = {}

                if(Object.values(argBranch).some(leafValue => typeof(leafValue) === "object")){
                    let {arg:leafArgs} = objectToDottedFormatRecursive({[""]: argBranch})
                    for(let leafName in leafArgs){
                        let leafValue = leafArgs[leafName]

                        mongoPredicatesArgs[argKey][leafName] = leafValue
                    }
                }
            }
        }

        //
        // Adds $ to all operators
        // Converts object queries to dot format, e.g. { a: { b: {gt: 3}}, c: { d: {eq:56}}}, is converted to(at the top-level):
        //      {
        //          a.b: {$gt: 3}
        //          a.c.d: {$eq: 56}
        //      }
        //
        function objectToDottedFormatRecursive(arg){
            const PREDICATE_OPERATORS = ["all", "and", "eq", "eq_", "gt", "gte", "in", "lt", "lte", "ne", "ne_", "nin", "nor", "not", "or", "regex"]
            let hasSubDocuments = false

            if(typeof(arg) === "object" && !Array.isArray(arg)){
                for(let argKey in arg){
                    let currBranch = arg[argKey]
                    for(let leafName in currBranch){
                        let leaf = currBranch[leafName]
                        let deleteArgKey = true
                        if(typeof(leaf) === "object" && !Array.isArray(leaf) && leaf !== null && !leaf?._bsontype && !Buffer.isBuffer(leaf)){
                            const argumentLeafName = PREDICATE_OPERATORS.some(predicateOperator => leafName === predicateOperator) ? `$${leafName.replace("_", "")}` : (argKey ? `${argKey}.${leafName}` : leafName)
                            hasSubDocuments = true

                            let {arg: res, hasSubDocuments: subLeafHasSubDocuments} = objectToDottedFormatRecursive({[argumentLeafName]: leaf})

                            if(Object.keys(leaf).includes("elemMatch_")){
                                if(Object.keys(leaf).length > 1){
                                    throw new AxApolloGooseMongoPredicatesReaderException(`Cannot have another element at the top-level along with elemMatch_: ${argumentLeafName}: ${JSON.stringify(leaf)}`)
                                }

                                //Adding back individual $elemMatch keys to leafName
                                arg[leafName] = {$elemMatch: {}}
                                for(let key in res){
                                    let keyEnd = key.split(".").slice(2).join(".") //Contains last part(not including $elemMatch and the leafName
                                    arg[leafName].$elemMatch[keyEnd] = res[key]
                                }
                            } else {
                                if(subLeafHasSubDocuments){
                                    for(let resArg in res){
                                        if(resArg !== `${argKey}.${leafName}`){
                                            arg[resArg] = res[resArg]
                                        }
                                    }

                                    delete arg[`${argKey}.${leafName}`]
                                } else {
                                    if(argKey){
                                        if(!PREDICATE_OPERATORS.some(predicate => argKey === predicate)){
                                            if(PREDICATE_OPERATORS.some(predicateOperator => leafName === predicateOperator)){
                                                deleteArgKey = false
                                                delete arg[argKey][leafName]

                                                arg[argKey][`$${leafName}`] = res
                                            } else {
                                                arg[`${argKey}.${leafName}`] = res
                                            }
                                        } else {
                                            const argKeyName = PREDICATE_OPERATORS.some(predicateOperator => argKey === predicateOperator) ? `$${argKey.replace("_", "")}` : argKey

                                            arg[argKeyName] = {[leafName]: {...res}}
                                        }
                                    } else {
                                        arg[leafName] = res
                                    }
                                }
                            }
                        } else if(Buffer.isBuffer(leaf)){
                            if(leafName.endsWith("_")){
                                leaf = Buffer.from(leaf.toString(), "base64").toString()
                            }

                            arg[`$${leafName.replace("_", "")}`] = leaf
                        } else {
                            const argumentLeafName = PREDICATE_OPERATORS.some(predicateOperator => leafName === predicateOperator) ? `$${leafName.replace("_", "")}` : leafName

                            if(Array.isArray(leaf) && leaf.length && typeof(leaf[0]) === "object" && !Array.isArray(leaf[0])){
                                arg[argumentLeafName] = []
                                for(let leafItemIndex in leaf){
                                    let leafItem = leaf[leafItemIndex]
                                    if(typeof(leafItem) === "object" && leafItem !== null && !leafItem?._bsontype){
                                        let {arg: res} = objectToDottedFormatRecursive({"": {...leafItem}})

                                        arg[argumentLeafName].push({...res})
                                    } else if(leafItem === null){
                                        arg[argumentLeafName] = leaf
                                    } else if(leafItem?._bsontype){ //Bson Types
                                        arg[argumentLeafName].push(leafItem)
                                    }
                                }
                            } else {
                                arg[argumentLeafName] = leaf
                            }
                        }

                        if(deleteArgKey){
                            delete arg[argKey]
                        }
                    }
                }
            }

            return {arg, hasSubDocuments}
        }

        return mongoPredicatesArgs
    }
}

module.exports = AxApolloGooseMongoPredicatesReader