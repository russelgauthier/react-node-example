const GqlObjectType = require("./GqlObjectType")

class GqlInterfaceType extends GqlObjectType {
    /*
    * @param name: {!String}, name of the interface
    * @param fields: {!Object} (key-value), e.g. {firstName: GqlWrappingType}
    *
    * implementedInterfaces(optional), either: GqlInterface or [GqlInterface]
    *       - This feature isn't supported by most implementations, but is as of GraphQL.js 1.15
    *       - https://github.com/graphql/graphql-spec/pull/373
    *       - Apollo ticket: https://github.com/apollographql/apollo-cli/pull/30 (in progress currently)
    *       - For description of use go to: https://dev.to/mikemarcacci/intermediate-interfaces-generic-utility-types-in-graphql-50e8
    *
     */
    constructor(name, fields, implementedInterfaces){
        super(name, fields, implementedInterfaces)

        if(typeof(fields) !== "object" || Array.isArray(fields)){
            throw new TypeError(`GqlInterfaceType requires an object with the field name and their GqlWrappingType`)
        }
    }

    toJSON(){
        return {...super.toJSON(), type: 'InterfaceType'}
    }
    toString(){
        return super.toString().replace("type ", "interface ")
    }
}

module.exports = GqlInterfaceType
