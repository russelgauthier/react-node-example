const GqlType = require("./GqlType")

class GqlScalarType extends GqlType {
    constructor(name){
        super(name)
    }

    toJSON(){
        return {...super.toJSON(), type: 'ScalarType'}
    }
    toString(){
        return super.toString()
    }
}

module.exports = GqlScalarType