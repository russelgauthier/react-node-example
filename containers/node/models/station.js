/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const {env} = require('./../config/config')
const {ObjectId} = require('mongodb')

const mongoose = require("mongoose")
const validator = require('validator')

let StationSchema = new mongoose.Schema({
    station_id: {
        type: String,
        required: true,
        minlength: 1
    },
    name: {
        type: String
    },
    physical_configuration: {
        type: String
    },
    lat: {
        type: Number
    },
    lon: {
        type: Number
    },
    altitude: {
        type: Number,
        required: false
    },
    address: {
        type: String,
        minlength: 1
    },
    capacity: {
        type: Number
    },
    rental_methods: {
        type: [String],
        required: true
    },
    groups: {
        type: [String],
        required: true
    },
    obcn: {
        type: String
    },
    nearby_distance: {
        type: Number
    },
    num_bikes_available: {
        type: Number,
        required: true
    },
    num_bikes_available_types: {
        mechanical: {
            type: Number,
            required: true
        },
        ebike: {
            type: Number,
            required: true
        }
    },
    num_bikes_disabled: {
        type: Number,
        required: true
    },
    num_docks_available: {
        type: Number,
        required: true
    },
    num_docks_disabled: {
        type: Number,
        required: true
    },
    is_installed: {
        type: Boolean,
        required: true
    },
    is_renting: {
        type: Boolean,
        required: true
    },
    is_returning: {
        type: Boolean,
        required: true
    },
    last_reported: {
        type: String,
        required: true
    },
    is_charging_station: {
        type: Boolean,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ["IN_SERVICE", "END_OF_LIFE"]
    }
})

StationSchema.pre('save', function(next){
    return Promise.resolve()
})
StationSchema.pre('update', async function(){
    return Promise.resolve()
})

const Station = mongoose.model('Station', StationSchema)

module.exports = Station
