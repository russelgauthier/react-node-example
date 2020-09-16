/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const express = require('express')
const errorHandler = require('express-json-errors')
const path = require("path")

const fs = require('fs').promises;
const util = require
const {ObjectId} = require('mongodb')

const _ = require('lodash')

const router = express.Router()
router.use(errorHandler())

const Station = require(path.join(global.rootPath, "models/station"))

router.get('/', async (req, res) => {
    try {
        const stationsInfoStr = await fs.readFile(path.join(global.rootPath, "routes/services/init/station_information.json"), "utf-8")
        const stationsStatusStr = await fs.readFile(path.join(global.rootPath, "routes/services/init/station_status.json"), "utf-8")

        const stationsInfo = JSON.parse(stationsInfoStr).data.stations
        const stationsStatus = JSON.parse(stationsStatusStr).data.stations

        let stations = {}
        stationsInfo.forEach(station => {
            stations[station.station_id] = {...station}
        })
        stationsStatus.forEach(station => {
            stations[station.station_id] = {...stations[station.station_id], ...station}
        })

        let stationsArray = Object.keys(stations).map(key => stations[key])

        await Station.insertMany(stationsArray);

        return res.status(201).send(stationsArray)
    } catch(e){
        return res.error({description: e.message || e})
    }
})

module.exports = router
