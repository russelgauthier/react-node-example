const mongoose = require("mongoose")
const { GqlEnumType, GqlObjectType } = require("../ax-apollogoose-sdl")
const { GqlSDL, GqlField } = require("./../ax-apollogoose-sdl/AxApolloGooseSdl")

const AxApolloGooseMongooseReaderException = require("./AxApolloGooseMongooseReaderException")

class AxApolloGooseMongooseReader {
    static typeMap = {
        "Boolean": "Boolean",
        "Buffer": "Buffer",
        "Date": "Date",
        "Decimal128": "Decimal128",
        "Float": "Float",
        "ID": "ID",
        "Int32": "Int32",
        "Long": "Long",
        "Map": "Map",
        "Mixed": "JSON",
        "Number": "Float",
        "ObjectID": "ID",
        "ObjectId": "ID",   /*  Both are aliases in MongoDB lib(ObjectID, ObjectId)    */
        "String": "String"
    }
    
    static addModel(mongooseModel){
        function mapModel(modelObj){
            //Used to check if fieldname is called one of these. This will make predicates not work. So, fields cannot be called any of these
            const PREDICATE_OPERATORS = ["all", "and", "elemMatch_", "eq", "eq_", "gt", "gte", "in", "lt", "lte", "ne", "ne_", "nin", "nor", "not", "or", "regex"]

            function mapModelInnerRecursive(reducedSchema, fieldNameUpper=""){
                if(typeof(reducedSchema) !== "object" || Array.isArray(reducedSchema)){
                    throw new TypeError("MapSchemaInnerRecursive reducedSchema must be an object")
                }
                if(typeof(fieldNameUpper) !== "string"){
                    throw new TypeError("MapSchemaInnerRecursive fieldNameUpper must be a string")
                }

                let gqlSDL = new GqlSDL()
                let gqlSDLObjectFields = {}
                for(let fieldName in reducedSchema){
                    const fieldValue = reducedSchema[fieldName]

                    //Throwing error if fieldName is the same as a predicate name
                    if(PREDICATE_OPERATORS.includes(fieldName)){
                        throw new AxApolloGooseMongooseReaderException(`Cannot have a fieldName called: ${fieldName}. Predicates won't work. Predicates: ${JSON.stringify(PREDICATE_OPERATORS)}. ${mongooseModel.modelName}`)
                    }

                    const {enumValues, enumValuesOriginal, fields, populates, ref, required, select=true, type, typeInner, typeInnerEnumValues, typeInnerEnumValuesOriginal, typeInnerPopulates, typeInnerRef, typeInnerRequired} = fieldValue
                    if(typeof(fields) === "object"){
                        const objectName = fieldNameUpper + "__" + fieldName.slice(0,1).toLocaleUpperCase() + fieldName.slice(1)
                        const graphqlSDLInnerObjects = mapModelInnerRecursive(fields, objectName)
                        Object.values(graphqlSDLInnerObjects.types).forEach(objType => {
                            if(objType instanceof GqlObjectType){
                                if(!select){ //Hidden field(output)
                                    objType.hiddenOutput = true
                                }

                                gqlSDL.addObjectType(objType)

                                gqlSDLObjectFields[fieldName] = gqlSDL.getTypeByParams(objType.name, type === "Array", required, type === "Array" ? required : false)
                            } else if(objType instanceof GqlEnumType){
                                gqlSDL.addEnumType(objType)
                            }
                        })
                    } else {
                        if(!populates && !typeInnerPopulates){
                            let fieldType = type === "Array" ? AxApolloGooseMongooseReader.typeMap[typeInner] : AxApolloGooseMongooseReader.typeMap[type]
                            if(enumValues?.length || typeInnerEnumValues?.length){
                                fieldType = fieldNameUpper + "__" + fieldName.slice(0, 1).toLocaleUpperCase() + fieldName.slice(1) + "__Enum"
                                gqlSDL.addEnumTypeByParams(fieldType, enumValues?.length ? enumValues : typeInnerEnumValues, enumValues?.length ? enumValuesOriginal : typeInnerEnumValuesOriginal)
                            }

                            gqlSDLObjectFields[fieldName] = gqlSDL.getTypeByParams(fieldType, type === "Array", required, type === "Array" ? typeInnerRequired : false)
                            if(!select){
                                gqlSDLObjectFields[fieldName].hiddenOutput = true
                            }
                        } else {
                            if(!gqlSDL.getType(ref || typeInnerRef)){
                                //Temporarily creating object to act as a pointer
                                let tmpObjectTypeName = `${ref || typeInnerRef}_`
                                let tmpObjectType = gqlSDL.getType(tmpObjectTypeName)
                                if(!tmpObjectType){
                                    tmpObjectType = gqlSDL.addObjectTypeByParams(tmpObjectTypeName, {_tmpField:GqlSDL.SCALARS.String.Optional})
                                    tmpObjectType["refTmpObject"] = ref || typeInnerRef
                                }

                                //Adding current field(only ref fields[Produces an instance of AxApolloGooseGqlField)
                                gqlSDLObjectFields[fieldName] = new GqlField(fieldName, gqlSDL.getTypeByParams(tmpObjectTypeName, type === "Array", required, type === "Array" ? typeInnerRequired : false), populates || typeInnerPopulates, ref || typeInnerRef)
                            }
                        }
                    }
                }

                if(Object.values(gqlSDLObjectFields).length){
                    gqlSDL.addObjectTypeByParams(fieldNameUpper, gqlSDLObjectFields)
                }

                return gqlSDL
            }

            let reducedSchemaObj = reduceMap(modelObj)

            addRefPopulateFields(reducedSchemaObj.schema)
            return mapModelInnerRecursive(reducedSchemaObj.schema, reducedSchemaObj.name)
        }
        function addRefPopulateFields(reducedSchema){
            function addRefFieldsRecursively(reducedSchema){
                for(let fieldName in reducedSchema){
                    let fieldValue = reducedSchema[fieldName]

                    if(fieldValue?.fields){
                        addRefPopulateFields(fieldValue.fields)
                    }

                    if(fieldValue?.ref){
                        let fieldNamePopulates = `${fieldName}_`
                        while(reducedSchema?.fieldNamePopulates){
                            fieldNamePopulates += "_"
                        }

                        reducedSchema[fieldNamePopulates] = {...fieldValue, populates:fieldName}

                    } else if(fieldValue?.typeInnerRef){
                        let fieldNamePopulates = `${fieldName}_`
                        while(reducedSchema?.fieldNamePopulates){
                            fieldNamePopulates += "_"
                        }

                        reducedSchema[fieldNamePopulates] = {...fieldValue, typeInnerPopulates:fieldName}
                    }
                }
            }

            addRefFieldsRecursively(reducedSchema)

            return reducedSchema
        }
        function reduceMap(modelObj){
            function reduceModelRecursively(modelObj){
                const SHOW_ASSERTS = true
                let result = {}

                for(let fieldName in modelObj){
                    let fieldValue = modelObj[fieldName]
                    if(typeof(fieldValue) === "function"){
                        result[fieldName] = {type: fieldValue.name, required: false}
                    } else if(Array.isArray(fieldValue)){
                        let fieldValueInner = fieldValue?.[0]
                        if(fieldValueInner){
                            if(typeof(fieldValueInner) === "function"){
                                result[fieldName] = {
                                    type: "Array",
                                    required: false,
                                    typeInner: fieldValueInner.name,
                                    typeInnerRequired: false
                                }
                            } else if(typeof(fieldValueInner) === "object" && !Array.isArray(fieldValueInner)){
                                if(fieldValueInner?.type){
                                    result[fieldName] = {
                                        type: "Array",
                                        typeInner: fieldValueInner.type?.name,
                                        required: false,
                                        typeInnerRequired: fieldValueInner?.required ?? false
                                    }

                                    //Optional fields
                                    if(fieldValueInner?.enum){
                                        result[fieldName].typeInnerEnumValuesOriginal = [...fieldValueInner.enum]
                                        result[fieldName].typeInnerEnumValues = fieldValueInner.enum.map(enumVal => GqlSDL.nameTransform(!`${enumVal}`.match(/^[_a-zA-Z]/) ? `${fieldValueInner.type?.name.slice(0, 1)}__${enumVal}` : `${enumVal}`, true).toUpperCase())
                                    }
                                    if(fieldValueInner?.ref){
                                        result[fieldName].typeInnerRef = fieldValueInner.ref
                                    }
                                } else {
                                    result[fieldName] = {
                                        type: "Array",
                                        required: false,
                                        fields: {
                                            ...reduceModelRecursively(fieldValueInner),
                                            _id: {type: "ObjectID", required: true}
                                        }
                                    }
                                }
                            } else {
                                SHOW_ASSERTS && console.log("OA", fieldName, fieldValue)
                            }
                        }
                    } else if(typeof(fieldValue) === "object"){
                        if(fieldValue?.type){
                            if(typeof(fieldValue.type) === "function"){
                                result[fieldName] = {
                                    type: fieldValue.type?.name,
                                    required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false
                                }

                                //Optional fields
                                if(fieldValue?.enum){
                                    result[fieldName].enumValuesOriginal = [...fieldValue.enum]
                                    result[fieldName].enumValues = fieldValue.enum.map(enumVal => GqlSDL.nameTransform(!`${enumVal}`.match(/^[_a-zA-Z]/) ? `${fieldValue.type?.name.slice(0, 1)}__${enumVal}` : `${enumVal}`, true).toUpperCase())
                                }
                                if(fieldValue?.ref){
                                    result[fieldName].ref = fieldValue.ref
                                }

                                //Hidden fields
                                if(fieldValue?.select !== undefined){
                                    result[fieldName].select = fieldValue.select
                                }
                            } else if(Array.isArray(fieldValue.type)){
                                let fieldValueInner = fieldValue.type?.[0]
                                if(fieldValueInner){
                                    if(typeof(fieldValueInner) === "function"){
                                        result[fieldName] = {
                                            type: "Array",
                                            typeInner: fieldValueInner.name,
                                            required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false,
                                            typeInnerRequired: false
                                        }

                                        //Hidden fields
                                        if(fieldValue?.select !== undefined){
                                            result[fieldName].select = fieldValue.select
                                        }
                                    } else if(Array.isArray(fieldValueInner)){
                                        result[fieldName] = {
                                            type: "Array",
                                            required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false,
                                            fields: reduceModelRecursively(fieldValueInner)
                                        }
                                    } else if(typeof(fieldValueInner) === "object"){
                                        if(fieldValueInner?.type){
                                            result[fieldName] = {
                                                type: "Array",
                                                typeInner: typeof(fieldValueInner?.type) !== "function" ? fieldValueInner?.type : fieldValueInner?.type?.name,
                                                required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false,
                                                typeInnerRequired: fieldValueInner?.required ?? false
                                            }

                                            if(fieldValueInner?.ref){
                                                result[fieldName].typeInnerRef = fieldValueInner.ref
                                            }
                                        } else {
                                            result[fieldName] = {
                                                type: "Array",
                                                required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false,
                                                fields: {
                                                    ...reduceModelRecursively(fieldValueInner),
                                                    _id: {type: "ObjectID", required: true}
                                                }
                                            }
                                        }

                                        //Hidden fields
                                        if(fieldValue?.select !== undefined){
                                            result[fieldName].select = fieldValue.select
                                        }
                                    } else {
                                        SHOW_ASSERTS && console.log("OC", fieldName, fieldValue, fieldValueInner, typeof(fieldValueInner))
                                    }
                                }
                            } else if(typeof(fieldValue.type) === "object"){
                                result[fieldName] = {
                                    type: "Object",
                                    required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false,
                                    fields: reduceModelRecursively(fieldValue.type)
                                }

                                //Hidden fields
                                if(fieldValue?.select !== undefined){
                                    result[fieldName].select = fieldValue.select
                                }
                            } else if(typeof(fieldValue.type) === "string"){
                                result[fieldName] = {
                                    type: fieldValue.type,
                                    required: typeof(fieldValue?.required) === "function" ? false : fieldValue?.required ?? false
                                }

                                //Hidden fields
                                if(fieldValue?.select !== undefined){
                                    result[fieldName].select = fieldValue.select
                                }
                            } else {
                                SHOW_ASSERTS && console.log("OD", fieldName, fieldValue)
                            }
                        } else {
                            result[fieldName] = {
                                type: "Object",
                                required: false,
                                fields: reduceModelRecursively(fieldValue)
                            }
                        }
                    } else if(typeof(fieldValue) === "string"){
                        SHOW_ASSERTS && console.log("OE", fieldName, fieldValue, typeof(fieldValue))
                    } else {
                        SHOW_ASSERTS && console.log("OG", fieldName, fieldValue, typeof(fieldValue))
                    }
                }

                return result
            }

            if(typeof(modelObj) !== "function" || !(modelObj() instanceof mongoose.Model)){
                throw new TypeError("AxApolloGoose->reduceSchema modelObj must be a Mongoose model")
            }

            return {
                name: modelObj.modelName,
                schema: {...reduceModelRecursively(modelObj.schema.obj), _id: {type: "ObjectID", required: true}}
            }
        }

        return mapModel(mongooseModel)
    }
    static addModels(mongooseModels, gqlSDL){
        if(!Array.isArray(mongooseModels)){
            throw new TypeError("AxApolloGoose->addModels requires an array of Mongoose Models")
        }

        mongooseModels.forEach(mongooseModel => {
            if(typeof(mongooseModel) !== "function" || !(mongooseModel() instanceof mongoose.Model)){
                throw new TypeError("AxApolloGoose->addModels requires an array of Mongoose Models")
            }
        })

        mongooseModels.forEach(mongooseModel => gqlSDL.mergeGqlSDL(AxApolloGooseMongooseReader.addModel(mongooseModel)))

        //Getting temporary objects(creating to make refs work temporarily)
        let refTmpObjects = {}
        for(let typeName in gqlSDL.types){
            let typeValue = gqlSDL.types[typeName]

            if(typeValue?.refTmpObject){
                refTmpObjects[typeName] = gqlSDL.getType(typeValue.refTmpObject)
            }
        }

        //Setting fields to referred to type(virtual fields)
        for(let typeName in gqlSDL.types){
            let typeValue = gqlSDL.types[typeName]

            if(typeValue?.fields){
                for(let fieldIndex in typeValue.fields){
                    let fieldValue = typeValue.fields[fieldIndex]

                    if(fieldValue.constructor.name === "AxApolloGooseGqlField" && fieldValue?.refTo && fieldValue?.refField){
                        fieldValue.type.gqlType = refTmpObjects[fieldValue.type.name]

                        //Setting model
                        fieldValue.refModel = mongooseModels.filter(model => model.modelName === fieldValue.type.gqlType.name)?.[0]
                    }
                }
            }
        }

        //Removing all temporary types
        for(let typeName in refTmpObjects){
            delete gqlSDL.types[typeName]
        }
    }
}

module.exports = AxApolloGooseMongooseReader