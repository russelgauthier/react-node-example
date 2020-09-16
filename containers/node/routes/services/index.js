/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const express = require('express')
const errorHandler = require('express-json-errors')

const router = express.Router()
router.use(errorHandler())

router.use(`/stations`, require(`./stations/index`))
router.use(`/init`, require(`./init/index`))

router.get('/', async (req, res) => {
    try {
        res.render('index', {title: 'Node.js Express Server'})
    } catch(e){
        return res.error({description: e.message || e})
    }
})

module.exports = router
