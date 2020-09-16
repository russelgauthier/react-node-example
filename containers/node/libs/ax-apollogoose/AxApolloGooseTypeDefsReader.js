class AxApolloGooseTypeDefsReader {
    static addTypedefs(gqlTypeDef, gqlSDL){
        function defsTransform(gqlTypeDefs){
            let defs = {}

            Object.values(gqlTypeDefs).forEach(typeDef => {
                let kind = typeDef?.kind
                let name = typeDef?.name?.value

                if(kind === "ObjectTypeDefinition" || kind === "InterfaceTypeDefinition" || kind === "InputObjectTypeDefinition"){
                    defs[name] = {
                        fields: {}
                    }

                    //Getting fields
                    typeDef.fields.forEach(field => {
                        let fieldKind = field.kind
                        let fieldName = field.name?.value

                        if(fieldKind === "FieldDefinition" || fieldKind === "InputValueDefinition"){
                            let currType = field.type
                            while(currType?.kind !== "NamedType"){
                                currType = currType?.type
                            }
                            let fieldType = currType.name?.value

                            let isArray = field.type?.kind === "ListType" || field.type?.type?.kind === "ListType"
                            let required = field.type?.kind === "NonNullType"
                            let requiredInner = isArray && (
                                required && field.type?.type?.type?.kind === "NonNullType" ||
                                !required && field.type?.type?.kind === "NonNullType"
                            )

                            if(name.match(/(^Mutation$)|(^Query$)|(^Subscription$)/) !== null){
                                defs[name].fields[fieldName] = {
                                    type: {
                                        name: fieldType,
                                        isArray,
                                        required,
                                        requiredInner
                                    }
                                }
                            } else {
                                defs[name].fields[fieldName] = {name: fieldType, isArray, required, requiredInner}
                            }

                            //Getting arguments(Mutation, Query, Subscription fields)
                            if(field?.arguments){
                                if(field.arguments.length){
                                    defs[name].fields[fieldName].args = {}
                                    field.arguments.forEach(argument => {
                                        let argumentName = argument.name?.value

                                        let currType = argument.type
                                        while(currType?.kind !== "NamedType"){
                                            currType = currType?.type
                                        }
                                        let argumentType = currType.name?.value

                                        let isArrayArg = argument.type?.kind === "ListType" || argument.type?.type?.kind === "ListType"
                                        let requiredArg = argument.type?.kind === "NonNullType"
                                        let requiredInnerArg = isArrayArg && (
                                            requiredArg && argument.type?.type?.type?.kind === "NonNullType" ||
                                            !requiredArg && argument.type?.type?.kind === "NonNullType"
                                        )

                                        defs[name].fields[fieldName].args[argumentName] = {
                                            name: argumentType,
                                            isArray: isArrayArg,
                                            required: requiredArg,
                                            requiredInner: requiredInnerArg
                                        }
                                    })
                                }
                            }
                        }
                    })

                    //Setting interfaces
                    if(typeDef?.interfaces && typeDef.interfaces.length){
                        defs[name].interfaces = typeDef.interfaces.map(intrface => intrface.name?.value)
                    }

                    //Setting type
                    if(kind === "ObjectTypeDefinition" && ["Mutation", "Query", "Subscription"].includes(name)){
                        defs[name].type = name + "SelectionSet"
                    } else if(kind === "ObjectTypeDefinition"){
                        defs[name].type = "Object"
                    } else if(kind === "InterfaceTypeDefinition"){
                        defs[name].type = "Interface"
                    } else if(kind === "InputObjectTypeDefinition"){
                        defs[name].type = "Input"
                    }
                } else if(kind === "EnumTypeDefinition"){
                    defs[name] = {
                        type: "Enum",
                        options: typeDef.values.map(value => value.name?.value)
                    }
                } else if(kind === "UnionTypeDefinition"){
                    defs[name] = {
                        type: "Union",
                        types: typeDef.types.map(type => type.name?.value)
                    }
                } else if(kind === "ScalarTypeDefinition"){
                    defs[name] = {
                        type: "CustomScalar"
                    }
                } else {
                    console.log("Error: 0x02")
                }
            })

            return defs
        }

        function defsTransformMap(defsTransformResult){
            if(typeof (defsTransformResult) !== "object"){
                throw new TypeError("TypeDefsTransformMap defsTransformResult argument must be an object returned from defsTransform()")
            }

            let filteredTypeDefs = {}

            //Getting CustomScalars & Enums (No dependencies) & removing
            for(let typeName in defsTransformResult){
                let def = defsTransformResult[typeName]
                let gqlType = gqlSDL.getType(typeName)


                if(gqlType === undefined){
                    filteredTypeDefs[typeName] = def
                } else {
                    if(typeName.match(/(^Mutation$)|(^Query$)|(^Subscription$)/)){
                        filteredTypeDefs[typeName] = def

                        //TODO: Write code here that will detect overlapping Query, Mutation & Subscription definitions
                        //This will not be an issue until models start adding default resolvers. No test data until then
                    }
                }
            }

            gqlSDL.addTypesByParams(filteredTypeDefs)
        }

        if(typeof (gqlTypeDef) !== "object"){
            throw new TypeError("AxApolloGoose->addTypeDefs requires a typeDefs that is an object")
        }

        if(!gqlTypeDef?.definitions){
            throw new TypeError("AxApolloGoose->addTypeDefs: Invalid GQL typedef. Requires a definition field")
        }

        let defsTransformation = defsTransform(gqlTypeDef.definitions)
        defsTransformMap(defsTransformation)
    }
}

module.exports = AxApolloGooseTypeDefsReader