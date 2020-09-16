/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const express = require('express')
const errorHandler = require('express-json-errors')
const path = require("path")

const {ObjectId} = require('mongodb')

const _ = require('lodash')

const router = express.Router()
router.use(errorHandler())

const Station = require(path.join(global.rootPath, "models/station"))

router.param('stationId', async(req, res, next, id) => {
    if(!ObjectId.isValid(id)){
        return res.error({description: `Invalid station id: ${id}`})
    }

    let station = await Station.findById({_id: id})
    if(!station){
        return res.error({description: `No station with id: ${id}`})
    }

    req.stationId = id
    req.station = station

    next()
})

router.get('/', async (req, res) => {
    try {
        const stations = await Station.find({}).lean()

        return res.send(stations.map(job => _.omit(job, ["__v"])))
    } catch(e){
        return res.error({description: e.message || e})
    }
})
router.get('/:stationId', async (req, res) => {
    try {
        res.send(_.omit(req.station, ["__v"]))
    } catch(e){
        res.error({description: e.message || e})
    }
})

module.exports = router
