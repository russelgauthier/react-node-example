const GqlType = require("./GqlType")

class GqlCustomScalarType extends GqlType {
    constructor(name){
        super(name)
    }
    toJSON(){
        return {
            ...super.toJSON(),
            type: 'CustomScalarType'
        }
    }
    toString(){
        return `scalar ${this.name}`
    }
}

module.exports = GqlCustomScalarType
