class AxApolloGooseMongoProjections {
    /*
    *
    * Gets list of fields to project for MongoDB, instead of all fields(default)
    *
    * @param info: {!Object} - Info field provided by Apollo resolvers(4th argument)
    * @param gqlSDL: {!AxApolloGooseSdl} - Schema definition
    *
    * @return {!Array<string, boolean>} - e.g. {fieldA: true, fieldB: true}, doesn't put false for ones that aren't queried for
    *
     */
    static get(info = {}, gqlSDL){
        let result = {}

        //Getting queried fields
        let fieldsFilter = Array.isArray(info.fieldNodes) && info.fieldNodes.filter(fieldNode => fieldNode.name?.value === info.fieldName && typeof(info.fieldName) !== "undefined")?.[0]
            .selectionSet?.selections || []

        fieldsFilter = fieldsFilter.filter(selection => selection.kind === "Field")
            .map(selection => selection.name)
            .filter(selection => selection.kind === "Name").map(selection => selection.value).filter(selection => typeof selection === "string")

        //Setting queried fields to true
        fieldsFilter.forEach(field => result[field] = true)

        //Adding non-virtual equivalents for virtual fields, if not existent
        let returnType = info.returnType?.name || info.returnType?.ofType?.name || info.returnType?.ofType?.ofType?.name || info.returnType?.ofType?.ofType?.ofType?.name
        let fields = info.fieldNodes[0]?.selectionSet?.selections.map(field => field?.name.value)
        let gqlType = gqlSDL.getType(returnType)

        gqlType.fields.filter(field => field.constructor.name === "AxApolloGooseGqlField" && field.refTo !== null && field.refField !== null).forEach(field => {
            if(fields.includes(field.name) && !result?.[`${field.refField}`]){
                //Selecting the referred-to field to get id, to expand the virtual field's resolver
                result[field.refField] = true
            }
        })

        return result
    }
}

module.exports = AxApolloGooseMongoProjections