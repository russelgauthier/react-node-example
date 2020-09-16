const GqlType = require("./GqlType")
const GqlObjectType = require("./GqlObjectType")

class GqlUnionType extends GqlType {
    #members = []
    constructor(name, gqlObjectTypes){
        super(name)

        if(!Array.isArray(gqlObjectTypes) || !gqlObjectTypes.length){
            throw new TypeError('GqlUnionType requires a non-empty array of GqlObjectTypes')
        }

        gqlObjectTypes.forEach(gqlObjectType => {
            if(!(gqlObjectType instanceof GqlObjectType)){
                throw new TypeError('GqlUnionType requires a non-empty array of GqlObjectTypes')
            }
        })

        this.#members = gqlObjectTypes
    }
    get members(){
        return this.#members
    }
    toJSON(){
        return {
            type: "UnionType",
            name: this.name,
            members: this.#members
        }
    }
    toString(){
        return `union ${this.name} = `
            + this.#members.map(member => member.name).join(' | ')
    }
}

module.exports = GqlUnionType