const Decimal128 = require("mongodb").Decimal128
const Int32 = require("mongodb").Int32
const Long = require("mongodb").Long

const { Kind } = require("graphql/language")
const { GqlSDL } = require("../ax-apollogoose-sdl")

const { AxApolloGooseGqlObjectType, AxApolloGooseGqlField } = require("./AxApolloGooseGqlObjectType")

class AxApolloGooseSdl extends GqlSDL {
    constructor(){
        super()

        /*
        *
        * Adding Custom Scalars
        *
         */
        this.addCustomScalarTypeByParams("Buffer", 'Buffer custom scalar type',
            val => {
                return Buffer.from(val)
            },
            val => {
                let result = val
                if(typeof(val) === "object" && !Array.isArray(val) && val !== null){
                    if(!val?._bsontype || val._bsontype !== "Binary"){
                        if(Buffer.isBuffer(val)){
                            result = result.toString()
                        } else {
                            throw new TypeError(`0 - AxApolloGoose TypeError: Cannot convert a non-Buffer bsontype to a Buffer ${val}`)
                        }
                    }
                } else {
                    throw new TypeError(`1- AxApolloGoose TypeError: Cannot convert a non-Buffer bsontype to a Buffer`)
                }

                return result
            },
            ast => {
                let result = null

                if([Kind.STRING, Kind.INT, Kind.FLOAT, Kind.ID].some(kind => ast.kind === kind)){
                    result = Buffer.from(ast.value)
                } else {
                    throw new TypeError(`2- AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Buffer. Only Float, ID, Int or String`)
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams("Date", 'Date custom scalar type in ISODate format',
            val => {
                return new Date(val)
            },
            val => {
                let result = val

                if(val instanceof Date){
                    result = val.toISOString()
                } else if(typeof(val) === "number"){
                    if(!Number.isInteger(val)){
                        throw new TypeError("AxApolloGoose TypeError: Cannot convert a non-integer number to Date")
                    }

                    result = (new Date(val)).toISOString()
                } else if(typeof(val) === "string"){
                    result = (new Date(val)).toISOString()
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to Date. Only String or Int`)
                }

                return result
            },
            ast => {
                let result = null

                if(ast.kind === Kind.INT || ast.kind === Kind.STRING){
                    try {
                        result = (new Date(ast.value)).toISOString()
                    } catch(e){
                        throw new TypeError(`AxApolloGoose TypeError: Cannot convert the following ${ast.kind.split("Value")[0]} with the value: ${ast.value} into a Date`)
                    }
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Date. Only Int, or String`)
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams('Decimal128', 'Decimal128 Format as per https://api.mongodb.com/python/3.4.0/api/bson/decimal128.html',
            val => {
                return new Decimal128(val)
            },
            val => {
                let result

                if(val instanceof Decimal128){
                    result = val
                } else if(typeof(val) === "string"){
                    try {
                        result = Decimal128.fromString(val)
                    } catch(e){
                        throw new TypeError(e.message)
                    }
                } else if(typeof(val) === "number"){
                    if(Number.isNaN(val)){
                        throw new TypeError("AxApolloGoose TypeError: Cannot convert NaN number to Decimal128")
                    } else if(!Number.isFinite(val)){
                        throw new TypeError("AxApolloGoose TypeError: Cannot convert Infinity to Decimal128")
                    }

                    result = Decimal128.fromString(val.toString())
                } else if(typeof(val) === "bigint"){
                    try {
                        result = Decimal128.fromString(val.toString())
                    } catch(e){
                        throw new TypeError(e.message)
                    }
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to Decimal128`)
                }

                return result.toString()
            },
            ast => {
                let result = null

                if(ast.kind === Kind.STRING || ast.kind === Kind.INT || ast.kind === Kind.FLOAT){
                    result = Decimal128.fromString(ast.value)
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Decimal128. Only String, Int or Float`)
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams("Int32", 'Int32 type that matches with Mongoose validators',
            val => {
                return new Int32(val)
            },
            val => {
                let result

                if(val instanceof Int32){
                    result = val
                } else if(typeof(val) === "number"){
                    if(!Number.isInteger(val)){
                        throw new TypeError("AxApolloGoose TypeError: Cannot convert a non-integer to Int32")
                    }

                    result = new Int32(val)
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to Int32`)
                }

                return parseInt(result.valueOf())
            },
            ast => {
                let result = null

                if(ast.kind === Kind.INT){
                    result = new Int32(ast.value)
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Int32. Only Int`)
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams("JSON", "JSON that matches with JSON spec: https://json.org",
            val => {
                return JSON.parse(val)
            },
            val => {
                let result = val

                if(typeof(val) === "object"){
                    result = JSON.stringify(val)
                } else if(typeof(val) === "string"){
                    try {
                        result = JSON.stringify(JSON.parse(val))
                    } catch(e){
                        throw new TypeError(`AxApolloGoose TypeError: Invalid JSON: ${val}`)
                    }
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to JSON. Only a object or string`)
                }

                return JSON.parse(result)
            },
            ast => {
                let result = null

                try {
                    if(ast.kind === Kind.OBJECT){
                        result = parseFieldsRecursive(ast.fields)
                    } else {
                        throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Object. Only a valid key-value paired Object`)
                    }
                } catch(e){
                    throw new TypeError(e.message)
                }

                function parseFieldsRecursive(fields){
                    let result = {}

                    if(Array.isArray(fields)){
                        for(let key in fields){
                            let field = fields[key]
                            let fieldName = field.name
                            let fieldValue = field.value

                            if(field.kind !== "ObjectField" || fieldName.kind !== "Name"){
                                throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${field.kind} to Object`)
                            }

                            result[fieldName.value] = parseFieldsRecursive(fieldValue)
                        }
                    } else if(typeof(fields) === "object" && fields?.kind){
                        let field = fields

                        if(field.kind === Kind.BOOLEAN){
                            result = Boolean(field.value)
                        } else if(field.kind === Kind.FLOAT){
                            result = parseFloat(field.value)
                        } else if(field.kind === Kind.INT){
                            result = parseInt(field.value)
                        } else if(field.kind === Kind.NULL){
                            result = null
                        } else if(field.kind === Kind.STRING){
                            result = field.value
                        } else if(field.kind === Kind.LIST){
                            result = field.values.map(value => parseFieldsRecursive(value))
                        } else if(field.kind === Kind.OBJECT){
                            result = parseFieldsRecursive(field.fields)
                        } else {
                            console.log(`AXApolloGoose->CustomScalarResolver->JSON error. Kind not handled: ${field.kind}. Value: ${field}`)
                        }
                    }

                    return result
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams("Long", "Long type that matches with Mongoose validators",
            val => {
                return Long.fromString(val)
            },
            val => {
                let result

                if(val instanceof Long){
                    result = val
                } else if(typeof(val) === "number"){
                    if(!Number.isInteger(val)){
                        throw new TypeError("AxApolloGoose TypeError: Cannot convert a non-integer to Long")
                    }

                    result = Long.fromNumber(val)
                } else if(typeof(val) === "bigint"){
                    result = Long.fromString(val.toString())
                } else if(typeof(val) === "string"){
                    result = Long.fromString(val)
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to Long`)
                }

                return result.toString()
            },
            ast => {
                let result = null

                if(ast.kind === Kind.INT){
                    result = Long.fromInt(ast.value)
                } else if(ast.kind === Kind.FLOAT){
                    result = Long.fromNumber(parseInt(ast.value))
                } else if(ast.kind === Kind.STRING){
                    result = Long.fromString(ast.value)
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Long. Only Int, Float or String`)
                }

                return result
            }
        )

        this.addCustomScalarTypeByParams("Map", "Map type that matches with Mongoose validators",
            val => {
                return val
            },
            val => {
                let result = null

                if(val instanceof Map){
                    val = Object.fromEntries(val)
                }

                if(typeof(val) === "object"){
                    for(let key in val){
                        if(typeof(key) !== "string"){
                            throw new TypeError("AxApolloGoose TypeError: Cannot have non-string keys in a Mongoose map")
                        }
                        if(typeof(val[key]) === "function" || typeof(val[key]) === "symbol" || typeof(val[key]) === "object" && val[key] !== null && val[key]?.kind !== Kind.STRING){
                            throw new TypeError("AxApolloGoose TypeError: Cannot have objects, functions or symbols as a value in a Mongoose map")
                        }
                    }

                    result = JSON.parse(JSON.stringify(val))
                } else {
                    throw new TypeError(`AxApolloGoose TypeError: Cannot convert type: ${typeof(val)} to a Mongoose map`)
                }

                return result
            },
            ast => {
                let result = null

                try {
                    if(ast.kind === Kind.OBJECT){
                        result = {}
                        Object.keys(ast.fields).map(key => {
                            let field = ast.fields[key]
                            let fieldName = field.name
                            let fieldValue = field.value

                            if(field.kind !== "ObjectField" || fieldName.kind !== "Name" || ![Kind.BOOLEAN, Kind.FLOAT, Kind.INT, Kind.NULL, Kind.STRING].includes(fieldValue.kind)){
                                throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${fieldValue.kind} to Object with Map. Only a valid key-value paired Object`)
                            }

                            if(fieldValue.kind === Kind.BOOLEAN){
                                result[fieldName.value] = Boolean(fieldValue.value)
                            } else if(fieldValue.kind === Kind.FLOAT){
                                result[fieldName.value] = parseFloat(fieldValue.value)
                            } else if(fieldValue.kind === Kind.INT){
                                result[fieldName.value] = parseInt(fieldValue.value)
                            } else if(fieldValue.kind === Kind.NULL){
                                result[fieldName.value] = null
                            } else if(fieldValue.kind === Kind.STRING){
                                result[fieldName.value] = fieldValue.value
                            }
                        })
                    } else {
                        throw new TypeError(`AxApolloGoose TypeError: Cannot convert a ${ast.kind.split("Value")[0]} to Object with Map. Only a valid key-value paired Object`)
                    }
                } catch(e){
                    throw new TypeError(e.message)
                }

                return result
            }
        )
    }
    addObjectTypeByParams(name, fields, implementedInterfaces){
        return this.addObjectType(new AxApolloGooseGqlObjectType(name, fields, implementedInterfaces))
    }
}

module.exports = {
    GqlSDL: AxApolloGooseSdl,
    GqlObjectType: AxApolloGooseGqlObjectType,
    GqlField: AxApolloGooseGqlField
}