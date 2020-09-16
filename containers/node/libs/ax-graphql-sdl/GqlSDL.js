const GqlType = require("./GqlType")
const { GqlWrappingType } = require("./GqlWrappingType")
const GqlScalarType = require("./GqlScalarType")
const GqlInputType = require("./GqlInputType")
const GqlUnionType = require("./GqlUnionType")
const GqlCustomScalarType = require("./GqlCustomScalarType")
const GqlSelection = require("./GqlSelection")


class GqlSDL {
    static SCALARS = {
        Boolean: new GqlScalarType("Boolean"),
        Float: new GqlScalarType("Float"),
        ID: new GqlScalarType("ID"),
        Int: new GqlScalarType("Int"),
        String: new GqlScalarType("String")
    }

    #types = {}
    constructor(){
        this.addType(new GqlQueryType())
        this.addType(new GqlMutationType())
        this.addType(new GqlSubscriptionType())

        Object.values(GqlSDL.SCALARS).forEach(scalar => this.addType(scalar))
    }

    get types(){
        return this.#types
    }

    addCustomScalarType(gqlCustomScalarType){
        if(!(gqlCustomScalarType instanceof GqlCustomScalarType)){
            throw new TypeError(`Can only add valid GQLCustomScalarType to GqlSDL`)
        }

        return this.addType(gqlCustomScalarType)
    }
    addCustomScalarTypeByParams(name){
        return this.addType(new GqlCustomScalarType(name))
    }

    addEnumType(enumType){
        if(!(enumType instanceof GqlEnumType)){
            throw new TypeError('enumType must be a GqlEnumType')
        }

        return this.addType(enumType)
    }
    addEnumTypeByParams(name, options){
        return this.addType(new GqlEnumType(name, options))
    }
    addInputType(gqlInputType){
        if(!(gqlInputType instanceof GqlInputType)){
            throw new TypeError('Can only add a valid GqlInputType')
        }

        return this.addType(gqlInputType)
    }
    addInputTypeByParams(name, fields){
        return this.addInputType(new GqlInputType(name, fields))
    }
    addInterfaceType(interfaceType){
        if(!(interfaceType instanceof GqlInterfaceType)){
            throw new TypeError('Can only a valid GqlInterfaceType')
        }

        return this.addType(interfaceType)
    }
    addInterfaceTypeByParams(name, fields, implementedInterfaces){
        return this.addType(new GqlInterfaceType(name, fields, implementedInterfaces))
    }
    addMutationType(mutationType, override=false){
        if(!(mutationType instanceof GqlMutationType)){
            throw new TypeError('Can only add selectionSets from GqlMutationType')
        }

        return this.addMutationTypeSelections(Object.values(mutationType.selectionSet), override)
    }
    addMutationTypeSelection(selection){
        return this.getType("Mutation").addSelection(selection)
    }
    addMutationTypeSelectionByParams(name, outputType, args){
        return this.getType("Mutation").addSelectionByParams(name, outputType, args)
    }
    addMutationTypeSelections(selections, override){
        return this.getType("Mutation").addSelections(selections, override)
    }

    addMutationTypeSelectionsByParams(params){
        return this.getType("Mutation").addSelectionsByParams(params)
    }
    addObjectType(gqlObjectType){
        if(!(gqlObjectType instanceof GqlObjectType)){
            throw new TypeError('Can only add a valid GqlObjectType')
        }

        return this.addType(gqlObjectType)
    }
    addObjectTypeByParams(name, fields, implementedInterfaces){
        return this.addObjectType(new GqlObjectType(name, fields, implementedInterfaces))
    }
    addQueryType(queryType){
        if(!(queryType instanceof GqlQueryType)){
            throw new TypeError("Can only add selectionSets from GqlQueryType")
        }
        return this.addQueryTypeSelections(Object.values(queryType.selectionSet))
    }
    addQueryTypeSelection(selection){
        return this.getType("Query").addSelection(selection)
    }
    addQueryTypeSelectionByParams(name, outputType, args){
        return this.getType("Query").addSelectionByParams(name, outputType, args)
    }
    addQueryTypeSelections(selections){
        return this.getType("Query").addSelections(selections)
    }
    addQueryTypeSelectionsByParams(params){
        return this.getType("Query").addSelectionsByParams(params)
    }

    addSubscriptionType(subscriptionType){
        if(!(subscriptionType instanceof GqlSubscriptionType)){
            throw new TypeError('Can only add selectionSets from GqlSubscriptionType')
        }

        return this.addQueryTypeSelections(Object.values(subscriptionType.selectionSet))
    }
    addSubscriptionTypeSelection(selection){
        return this.getType("Subscription").addSelection(selection)
    }
    addSubscriptionTypeSelectionByParams(name, outputType, args){
        return this.getType("Subscription").addSelectionByParams(name, outputType, args)
    }
    addSubscriptionTypeSelections(selections){
        return this.getType("Subscription").addSelections(selections)
    }
    addSubscriptionTypeSelectionsByParams(params){
        return this.getType("Subscription").addSelectionsByParams(params)
    }
    addType = function(gqlType){
        let gqlTypes = [GqlType, GqlOperationType, GqlInterfaceType]
        if(!(gqlTypes.some(currGqlType => gqlType instanceof currGqlType))){
            throw new TypeError('Can only add GqlType to SDL definition')
        }

        if(!gqlType.name.length){
            throw new TypeError("Can only add types to SDL definition that are non-empty strings")
        }

        if(this.#types[gqlType.name] !== undefined){
            throw new Error(`Duplicate definition type provided for ${gqlType.name} to SDL`)
        }

        return this.#types[GqlSDL.nameTransform(gqlType.name)] = gqlType
    }

    addTypesByParams(types = {}){
        let resolveTypes = typesMapped => {
            let typesDependencies = {}

            for(let typeName in typesMapped){
                let type = typesMapped[typeName]
                let currType = type.type
                let currTypeDependencies = new Set()

                //Fields & Args
                if(!["CustomScalar", "Enum", "Union"].includes(currType)){
                    let fields = type.fields
                    for(let fieldName in fields){
                        let fieldType = !["MutationSelectionSet", "QuerySelectionSet", "SubscriptionSelectionSet"].includes(currType) ? fields[fieldName] : fields[fieldName].type
                        if(!(fieldType instanceof GqlWrappingType)){
                            let gqlType = this.getType(fieldType.name)
                            if(!!gqlType){
                                fieldType = gqlType.getWrappingType(fieldType.isArray, fieldType.required, fieldType.requiredInner)

                                if(!["MutationSelectionSet", "QuerySelectionSet", "SubscriptionSelectionSet"].includes(currType)){
                                    fields[fieldName] = fieldType
                                } else {
                                    fields[fieldName].type = fieldType
                                }
                            } else {
                                currTypeDependencies.add(fieldType.name)
                            }
                        }

                        if(["MutationSelectionSet", "QuerySelectionSet", "SubscriptionSelectionSet"].includes(currType)){
                            let fieldArgs = fields[fieldName].args

                            for(let argName in fieldArgs){
                                let argType = fieldArgs[argName]
                                if(!(argType instanceof GqlWrappingType)){
                                    let gqlType = this.getType(argType.name)
                                    if(!!gqlType){
                                        argType = gqlType.getWrappingType(argType.isArray, argType.required, argType.requiredInner)

                                        fields[fieldName].args[argName] = argType
                                    } else {
                                        currTypeDependencies.add(argType.name)
                                    }
                                }
                            }
                        }
                    }
                }

                //Interfaces(all types except CustomScalar, Enum, Input & Union)
                if(!["CustomScalar", "Enum", "Input", "Union"].includes(currType)){
                    type.interfaces = type.interfaces.map(intrface => {
                        if(!(intrface instanceof GqlInterfaceType)){
                            let gqlType = this.getType(intrface)
                            if(!!gqlType){
                                intrface = gqlType
                            } else {
                                currTypeDependencies.add(intrface)
                            }
                        }

                        return intrface
                    })
                }

                //Union
                if(currType === "Union"){
                    type.types = type.types.map(type => {
                        if(!(type instanceof GqlObjectType)){
                            let gqlType = this.getType(type)
                            if(!!gqlType){
                                type = gqlType
                            } else {
                                currTypeDependencies.add(type)
                            }
                        }

                        return type
                    })
                }

                typesDependencies[typeName] = [...currTypeDependencies]
            }

            return typesDependencies
        }

        //Testing types
        if(typeof(types) !== "object" || Array.isArray(types)){
            throw new TypeError("GqlSDL->addTypesByParams: Can only add an object of types(name, fields, implementedInterfaces[optional])")
        }

        //Testing all objects within type
        let typesMapped = {}
        for(let typeName in types){
            let currType = types[typeName]

            //Name check
            if(typeof(typeName) !== "string"){
                throw new TypeError("GqlSDL->addTypesByParams: each object must have a name(string)")
            }

            //Type checks
            if(typeof(currType.type) === "undefined" || !["CustomScalar", "Enum", "Input", "Interface", "MutationSelectionSet", "Object", "QuerySelectionSet", "SubscriptionSelectionSet", "Union"].includes(currType.type)){
                throw new TypeError(`GqlSDL->addTypesByParams: must provide a valid param.type: CustomScalar, Enum, Input, Interface, MutationSelectionSet, Object, QuerySelectionSet, SubscriptionSelectionSet, Union. Type name: ${typeName}`)
            }

            //Fields & args checks
            if(!["CustomScalar", "Enum", "Union"].includes(currType.type)){
                if(typeof(currType.fields) !== "object" || Array.isArray(currType.fields) || !Object.values(currType.fields).length){
                    throw new TypeError(`GqlSDL->addTypesByParams: Each Operation Type, Object, Input or Interface must have a non-empty object list of fields. Type name: ${typeName}`)
                }

                for(let fieldName in currType.fields){
                    if(typeof(fieldName) !== "string"){
                        throw new TypeError(`GqlSDL->addTypesByParams: Every field name must be a string. Type name: ${typeName}`)
                    }

                    let fieldType = !["MutationSelectionSet", "QuerySelectionSet", "SubscriptionSelectionSet"].includes(currType.type) ? currType.fields[fieldName] : currType.fields[fieldName].type
                    if(!(fieldType instanceof GqlWrappingType)){
                        if(typeof(fieldType) !== "object" || Array.isArray(fieldType)){
                            throw new TypeError(`GqlSDL->addTypesByParams. Every field must provide a GqlWrappingType or a object describing it: {name:!string, required:!boolean, isArray:boolean, requiredInner:boolean}, requiredInner is mandatory if isArray is true: Type name: ${typeName}. Field name: ${fieldName}`)
                        } else {
                            if(typeof(fieldType.name) !== "string"){
                                throw new TypeError(`GqlSDL->addTypesByParams. Every field type, if an object, must provide a name: !string. Type name: ${typeName}. Field name: ${fieldName}`)
                            } else if(typeof(fieldType.required) !== "boolean"){
                                throw new TypeError(`GqlSDL->addTypesByParams. Every field type, if an object, must indicate if required: !boolean. Type name: ${typeName}. Field name: ${fieldName}`)
                            }

                            if(typeof(fieldType.isArray) !== "undefined"){
                                if(typeof(fieldType.isArray) !== "boolean"){
                                    throw new TypeError(`GqlSDL->addTypesByParams. Every field type, if an object, if indicated(default=false) must provide a boolean for isArray key. Type name: ${typeName}. Field name: ${fieldName}`)
                                } else {
                                    if(fieldType.isArray){
                                        if(typeof(fieldType.requiredInner) !== "boolean"){
                                            throw new TypeError(`GqlSDL->addTypesByParams. Every field type, if an object, if indicated(default=false) must provide a boolean for isArray key. Type name: ${typeName}. Field name: ${fieldName}`)
                                        }
                                    }
                                }
                            } else {
                                fieldType.isArray = false
                                fieldType.requiredInner = false
                            }
                        }
                    }

                    //Args type checks (MutationSelectionSet, QuerySelectionSet, SubscriptionSelectionSet) fields
                    if(["MutationSelectionSet", "QuerySelectionSet", "SubscriptionSelectionSet"].includes(currType.type)){
                        let fieldArgs = currType.fields[fieldName].args
                        if(typeof(fieldArgs) !== "undefined"){
                            if(typeof(fieldArgs) !== "object" || Array.isArray(fieldArgs)){
                                throw new TypeError(`Gql->addTypesByParams. For Operation Types, if args are provided, must be an object: {name:!string, type:GqlWrappingType|{name:!string, required:!boolean, isArray:boolean[default=false], requiredInner:boolean[default=false]}, where requiredInner is mandatory if isArray is true. Type name: ${typeName}`)
                            }
                        } else {
                            fieldArgs = {}
                        }

                        currType.fields[fieldName].args = fieldArgs
                        for(let argName in fieldArgs){
                            if(typeof(argName) !== "string"){
                                throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types, if args provided, the key value must be a string. Type name: ${typeName}. Field name: ${fieldName}`)
                            }

                            let argType = fieldArgs[argName]
                            if(!(argType instanceof GqlWrappingType)){
                                if(typeof(argType) !== "object" || Array.isArray(argType)){
                                    throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types, if args provided, must be an object: {!string: {name:!string, type:GqlWrappingType|{name:!string, required:!boolean, isArray:boolean[default=false], requiredInner:boolean[default=false]}}, where requiredInner is mandatory if isArray is true. Type name: ${typeName}. Field name: ${fieldName}`)
                                }

                                if(typeof(argType.name) !== "string" || !argType.name.length){
                                    throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types field argument type, if a non-GqlWrappingType provided, name(!string, non-empty) required. Type name: ${typeName}. Field name: ${fieldName}`)
                                }
                                if(typeof(argType.required) !== "boolean"){
                                    throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types field argument type, if a non-GqlWrappingType provided, required mandatory(!boolean). Type name: ${typeName}. Field name: ${fieldName}. Arg name: ${argName}`)
                                }

                                if(typeof(argType.isArray) !== "undefined"){
                                    if(typeof(argType.isArray) !== "boolean"){
                                        throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types field argument type, if a non-GqlWrappingType provided, isArray, if provided, must provide a boolean. Type name: ${typeName}. Field name: ${fieldName}. Arg name: ${argName}`)
                                    } else {
                                        if(argType.isArray){
                                            if(typeof(argType.requiredInner) !== "boolean"){
                                                throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types field argument type, if a non-GqlWrappingType provided, if isArray is provided and true, requiredInner(!boolean) is required. Type name: ${typeName}. Field name: ${fieldName}. Arg name: ${argName}`)
                                            }
                                        }
                                    }
                                } else {
                                    argType.isArray = false
                                    argType.requiredInner = false
                                }

                                fieldArgs[argName] = argType
                            } else {
                                if(!(argType.gqlType instanceof GqlScalarType) && !(argType.gqlType instanceof GqlCustomScalarType) && !(argType.gqlType instanceof GqlInputType)){
                                    throw new TypeError(`GqlSDL->addTypesByParams. For Operation Types args, the types can only: GqlInputType, GqlScalarType or GqlCustomScalarType can be used. Type name: ${typeName}. Field name: ${fieldName}`)
                                }
                            }
                        }
                    }
                }
            }

            //Interface checks
            if(!["CustomScalar", "Enum", "Input", "Union"].includes(currType.type)){
                currType.interfaces = typeof(currType?.interfaces) !== "undefined" ? currType.interfaces : []
                if(!Array.isArray(currType.interfaces)){
                    throw new TypeError(`GqlSDL->addTypesByParams: each object, when implementedInterfaces are provided, must be an array. Type name: ${typeName}`)
                }

                currType.interfaces.forEach(intrface => {
                    if(!(intrface instanceof GqlInterfaceType)){
                        if(typeof(intrface) !== "string"){
                            throw new TypeError(`GqlSDL->addTypesByParams: if implementedInterfaces are provided, they must be an array of strings and GqlInterfaceTypes. Type name: ${typeName}`)
                        }
                    }
                })
            }

            //Enum - Options checks
            if(currType.type === "Enum"){
                if(!Array.isArray(currType.options) || currType.options.length < 2){
                    throw new TypeError(`GqlSDL->addTypesByParams: For Enums, at least 2 string options must be provided. Type name: ${typeName}`)
                }
                currType.options.forEach(option => {
                    if(typeof(option) !== "string"){
                        throw new TypeError(`GqlSDL->addTypesByParams: For Enums, at least 2 string options must be provided. Type name: ${typeName}`)
                    }
                })
            }

            //Union Types checks
            if(currType.type === "Union"){
                if(!Array.isArray(currType.types) || currType.types.length < 2){
                    throw new TypeError(`GqlSDL->addTypesByParams: For Unions, at least 2 options must be provided(String typeNames, or GqlObjectType). Type name: ${typeName}`)
                }

                currType.types.forEach(type => {
                    if(!(type instanceof GqlObjectType)){
                        if(typeof(type) !== "string"){
                            throw new TypeError(`GqlSDL->addTypesByParams: For Unions, at least 2 options must be provided(String typeNames, or GqlObjectType). Type name: ${typeName}`)
                        }
                    } else {
                        if(type instanceof GqlInterfaceType){
                            throw new TypeError(`GqlSDL->addTypesByParams: For Unions, only GqlObjectTypes(non-GqlInterfaceTypes) or Strings can be provided for types. Type name: ${typeName}`)
                        }
                    }
                })
            }

            typesMapped[typeName] = currType
        }

        //Processing enums & custom scalars, as they don't have dependencies
        for(let typeName in typesMapped){
            let type = typesMapped[typeName]
            let currType = type.type

            if(currType === "CustomScalar"){
                this.addCustomScalarTypeByParams(typeName)

                delete typesMapped[typeName]
            } else if(currType === "Enum"){
                this.addEnumTypeByParams(typeName, type.options)

                delete typesMapped[typeName]
            }
        }

        //Resolving types
        let typesDependencies = resolveTypes(typesMapped)

        //Finding co-depedencies
        let typesCoDependencies = {}
        for(let typeName in typesDependencies){
            //Only these types can have co-dependencies
            if(["Input", "Interface", "Object"].includes(typesMapped[typeName].type)){
                let typeDependencies = typesDependencies[typeName]

                let coDependencies = typeDependencies.filter(typeDependency => typesDependencies[typeDependency].includes(typeName))
                if(coDependencies.length){
                    typesCoDependencies[typeName] = coDependencies
                }
            }
        }

        //Creating each type without non-codependent fields, and tmpField if no other fields exist
        for(let typeName in typesCoDependencies){
            let typeInfo = typesMapped[typeName]
            let currType = typeInfo.type

            if(currType === "Input"){
                this.addInputTypeByParams(typeName, {_tmpField: GqlSDL.SCALARS.ID.NonNullable})
            } else if(currType === "Interface"){
                this.addInterfaceTypeByParams(typeName, {_tmpField: GqlSDL.SCALARS.ID.NonNullable}, [])
            } else if(currType === "Object"){
                this.addObjectTypeByParams(typeName, {_tmpField: GqlSDL.SCALARS.ID.NonNullable}, [])
            }
        }

        //Going until all non-codependent types until only remaining types to be resolved are co-dependencies
        let typesMappedWithoutCoDepedents = {}
        for(let typeName in typesMapped){
            if(typesCoDependencies[typeName] === undefined){
                typesMappedWithoutCoDepedents[typeName] = typesMapped[typeName]
            }
        }

        //Going until all non-codependent types until only remaining types to be resolved are co-dependencies
        while(Object.keys(typesMappedWithoutCoDepedents).length){
            for(let typeName in typesMappedWithoutCoDepedents){
                let type = typesMappedWithoutCoDepedents[typeName]
                let typeDependencies = typesDependencies[typeName]
                if(!typeDependencies.length){
                    let currType = type.type
                    if(currType === "Input"){
                        this.addInputTypeByParams(typeName, type.fields)
                    } else if(currType === "Interface"){
                        this.addInterfaceTypeByParams(typeName, type.fields, type.interfaces)
                    } else if(currType === "MutationSelectionSet"){
                        this.addMutationTypeSelectionsByParams(Object.keys(type.fields).map(fieldName => ({name: fieldName, outputType: type.fields[fieldName].type, args: type.fields[fieldName].args})))
                    } else if(currType === "Object"){
                        this.addObjectTypeByParams(typeName, type.fields, type.interfaces)
                    } else if(currType === "QuerySelectionSet"){
                        this.addQueryTypeSelectionsByParams(Object.keys(type.fields).map(fieldName => ({name: fieldName, outputType: type.fields[fieldName].type, args: type.fields[fieldName].args})))
                    } else if(currType === "SubscriptionSelectionSet"){
                        this.addSubscriptionTypeSelectionsByParams(Object.keys(type.fields).map(fieldName => ({name: fieldName, outputType: type.fields[fieldName].type, args: type.fields[fieldName].args})))
                    } else if(currType === "Union"){
                        this.addUnionTypeByParams(typeName, type.types)
                    }

                    delete typesMappedWithoutCoDepedents[typeName]
                }
            }

            typesDependencies = resolveTypes(typesMappedWithoutCoDepedents)
        }

        //Adding missed out fields in types with co-dependencies
        let typesMappedWithCoDepedents = {}
        for(let typeName in typesMapped){
            if(typesCoDependencies[typeName] !== undefined){
                typesMappedWithCoDepedents[typeName] = typesMapped[typeName]
            }
        }

        typesDependencies = resolveTypes(typesMappedWithCoDepedents)
        for(let typeName in typesMappedWithCoDepedents){
            let type = typesMappedWithCoDepedents[typeName]
            let gqlType = this.getType(typeName)

            for(let fieldName in type.fields){
                let fieldType = type.fields[fieldName]

                gqlType.addField(fieldName, fieldType)
            }

            //Removing temporary field
            gqlType.removeField("_tmpField")

            //Adding missed out interfaces in types with co-dependencies
            if(["Interface", "Object"].includes(type.type)){
                type.interfaces.forEach(intrface => {
                    gqlType.addInterface(intrface)
                })
            }
        }
    }
    addUnionType(unionType){
        if(!(unionType instanceof GqlUnionType)){
            throw new TypeError('unionType must be a GqlUnionType')
        }

        return this.addType(unionType)
    }
    addUnionTypeByParams(name, gqlObjectTypes){
        return this.addType(new GqlUnionType(name, gqlObjectTypes))
    }
    /*
    *
    * @return {!GqlType}
    *
     */
    getType(name){
        return this.#types[name]
    }
    getTypeByParams = function(name, isArray=false, required=false, requiredInner=false){
        if(typeof(name) !== "string"){
            throw new TypeError("GqlSDL->getGqlTypeByParams name must be a string")
        }
        if(typeof(isArray) !== "boolean"){
            throw new TypeError("Gql->getGqlTypeByParams isArray must be a boolean")
        }
        if(typeof(required) !== "boolean"){
            throw new TypeError("Gql->getGqlTypeByParams required must be a boolean")
        }
        if(typeof(requiredInner) !== "boolean"){
            throw new TypeError("Gql->getGqlTypeParams requiredInner must be a boolean")
        }

        let type = this.getType(name)
        if(!type){
            throw new TypeError(`Couldn't find type: ${name}`)
        }

        return type.getWrappingType(isArray, required, requiredInner)
    }
    mergeGqlSDL(gqlSDL, ignoreDuplicates=true, duplicatesDeleteInner=true){
        if(!(gqlSDL instanceof GqlSDL)){
            throw new TypeError('GqlSDL->mergeGqlSDL can only merge with other GqlSDLs')
        }
        if(typeof(ignoreDuplicates) !== "boolean"){
            throw new TypeError("GqlSDL->mergeGqlSDL ignoreDuplicates must be a boolean")
        }
        if(typeof(duplicatesDeleteInner) !== "boolean"){
            throw new TypeError("GqlSDL->mergeGqlSDL duplicatesDeleteInner must be a boolean")
        }

        Object.values(gqlSDL.types).forEach(type => {
            if(!(type instanceof GqlOperationType)){
                if(ignoreDuplicates){
                    if(this.types?.[type.name]){
                        if(duplicatesDeleteInner){
                            delete this.types[type.name]
                        } else {
                            return
                        }
                    }
                }

                this.addType(type)
            } else {
                if(type.name === "Mutation"){
                    this.addMutationType(type, ignoreDuplicates && duplicatesDeleteInner)
                } else if(type.name === "Query"){
                    this.addQueryType(type, ignoreDuplicates && duplicatesDeleteInner)
                } else if(type.name === "Subscription"){
                    this.addSubscriptionType(type, ignoreDuplicates && duplicatesDeleteInner)
                }
            }
        })
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

        let gqlSDLResult = new GqlSDL()

        gqlSDLs.forEach(gqlSDL => {
            gqlSDLResult.mergeGqlSDL(gqlSDL)
        })

        return gqlSDLResult
    }
    static nameTransform(name, isEnumValue=false){
        if(typeof(name) !== "string"){
            throw new TypeError("GqlSDL->nameTransform name must be a string")
        }
        if(typeof(isEnumValue) !== "boolean"){
            throw new TypeError("GqlSDL->nameTransform isEnumValue must be a boolean")
        }

        if(isEnumValue){ //Look at: https://spec.graphql.org/June2018/#EnumValue for name spec for enum values. Transforming to uppercase if true, false or null (invalid values)
            name = name.replace(/^true$/, "TRUE").replace(/^false$/, "FALSE").replace(/^null$/, "NULL")
        }

        //Look at: https://spec.graphql.org/June2018/#Name for the name spec
        return name.replace(/^[^_A-Za-z]/, '_').replace(/[^_A-Za-z0-9]/g, '_')
    }
    toJSON(){
        return {
            types: this.#types
        }
    }
    toString(){
        let outputObjectTypes = [GqlInputType, GqlObjectType, GqlInterfaceType, GqlEnumType, GqlUnionType, GqlCustomScalarType, GqlQueryType, GqlMutationType, GqlSubscriptionType]

        return Object.values(this.#types).filter(gqlType =>
            outputObjectTypes.some(outputType => gqlType instanceof outputType)
            && (!(gqlType instanceof GqlOperationType) || Object.keys(gqlType.selectionSet).length)
        ).join('\n')
    }
}

module.exports = {
    GqlType, GqlWrappingType,
    GqlScalarType, GqlCustomScalarType,
    GqlInputType,
    GqlUnionType, GqlSelection,
    GqlSDL
}

const GqlEnumType = require("./GqlEnumType")
const GqlMutationType = require("./GqlMutationType")
const GqlOperationType = require("./GqlOperationType")
const GqlInterfaceType = require("./GqlInterfaceType")
const GqlObjectType = require("./GqlObjectType")
const GqlQueryType = require("./GqlQueryType")
const GqlSubscriptionType = require("./GqlSubscriptionType")

module.exports = {
    ...module.exports,
    GqlObjectType, GqlInterfaceType,
    GqlEnumType,
    GqlOperationType, GqlMutationType, GqlQueryType, GqlSubscriptionType
}