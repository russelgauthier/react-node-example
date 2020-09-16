const { GqlSDL } = require("./GqlSDL")
const GqlSelection = require("./GqlSelection")

class GqlOperationType {
    #name
    #selectionSet = {}
    constructor(name){
        if(!["Query", "Mutation", "Subscription"].includes(name)){
            throw new Error("Can only have a GqlOperationType of: Query, Mutation or Subscription")
        }

        this.#name = name
    }
    get name(){
        return this.#name
    }
    get selectionSet(){
        return this.#selectionSet
    }

    addSelection(selection, override=false){
        if(!(selection instanceof GqlSelection)){
            throw new TypeError(`Only a GqlSelection can be added to the SelectionSet for a ${this.#name}Type`)
        }
        if(typeof(override) !== "boolean"){
            throw new TypeError(`GqlSelection->addSelection override must be a boolean`)
        }

        //Forcing conformance to Name spec as specified in GqlSDL.nameTransform
        selection.name = GqlSDL.nameTransform(selection.name)

        if(!override){
            if(this.#selectionSet?.[selection.name] !== undefined){
                throw new Error(`GqlOperationType->addSelection cannot add a duplicate entry unless override is set to false for: ${this.name}: ${selection.name}`)
            }
        }
        this.#selectionSet[selection.name] = selection

        return selection
    }
    addSelectionByParams(name, outputType, args){
        let gqlSelection = new GqlSelection(name, outputType, args)

        return this.addSelection(gqlSelection)
    }
    addSelections(selections, override=false){
        if(!Array.isArray(selections)){
            throw new TypeError(`AddSelections to ${this.#name}Type must be an array of GQLSelection`)
        }
        if(typeof(override) !== "boolean"){
            throw new TypeError(`GqlSelection->addSelections override must be a boolean`)
        }

        selections.forEach(selection => {
            if(!(selection instanceof GqlSelection)){
                throw new TypeError(`AddSelections to ${this.#name}Type must be an array of GQLSelection`)
            }
        })

        selections.forEach(selection => {
            this.addSelection(selection, override)
        })

        return selections
    }
    addSelectionsByParams(params){
        if(!Array.isArray(params)){
            throw new TypeError(`AddSelectionsByParams to ${this.#name}Type requires an array of params`)
        }

        return params.map(param => this.addSelectionByParams(param.name, param.outputType, param.args))
    }

    toJSON(){
        return {
            type: `${this.#name}Type`,
            selectionSet: this.#selectionSet
        }
    }
    toString(){
        return `type ${this.#name} {\n`
            + Object.values(this.#selectionSet).map(selection => `\t${selection}`).join('\n')
            + `\n}`
    }
}

module.exports = GqlOperationType
