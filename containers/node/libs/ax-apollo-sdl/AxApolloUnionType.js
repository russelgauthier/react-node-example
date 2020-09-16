const { GqlUnionType } = require("../ax-apollo-sdl")

class AxApolloUnionType extends GqlUnionType {
    #resolverFnc
    constructor(name, gqlObjectTypes, resolverFnc){
        if(typeof(resolverFnc) !== "undefined" && typeof(resolverFnc) !== "function"){
            throw new TypeError("GqlUnionType resolverFnc must be a function")
        }

        super(name, gqlObjectTypes)

        this.#resolverFnc = resolverFnc !== undefined ? resolverFnc : this.autoGenerateResolverFnc()
    }
    autoGenerateResolverFnc(){
        let unique_fields = {}

        let members_info = this.members.map(member => ({name: member.name, fields: member.fields.map(field => field.name)}))
        members_info.forEach((member, memberIndex) => {
            let search_fields = members_info.filter((member, i) => i !== memberIndex)
                .map(member => member.fields).flat()

            let unique_field = member.fields.find(field => search_fields.indexOf(field) === -1)
            if(unique_field !== undefined){
                unique_fields[member.name] = unique_field
            } else {
                //TODO: Write code that will get the types to distinguish them, but this will have to translate to the info field in ApolloGraphQL resolvers in generator function
            }
        })

        members_info.forEach(member => {
            if(unique_fields[member.name] === undefined){
                throw new TypeError(`Couldn't generate a resolver function for ${this.name} as there weren't unique field names between types: ${members_info.map(member => member.name).join(", ")}`)
            }
        })

        return (unique_fields => (obj, context, info) => Object.keys(unique_fields).find(typeName => obj[unique_fields[typeName]]) ?? null)(unique_fields)
    }

    getResolverMap(){
        return {
            [this.name]: this.#resolverFnc
        }
    }
    toJSON(){
        return {...super.toJSON(), resolverFnc: this.#resolverFnc}
    }
}

module.exports = AxApolloUnionType