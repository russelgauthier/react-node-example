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

router.param('id', function(req, res, next, id){
    req.id = id

    next()
})

router.get('/:id', async (req, res) => {
    try {
        let response_table = {
            "www.2point7182.com": "BgkZwOcBuaPUjRbWP8bgY68OonN6h73Ofs3HVuOoQ6w.w1zAQ9gPgNrDmg9dpMZ4_uWl023zy9-hsOmW3Ok1WNQ",
            "2point7182.com": "k0BDqUVgS93YEXslfCibgk67AbdCU68u1JAXyJNbN30.w1zAQ9gPgNrDmg9dpMZ4_uWl023zy9-hsOmW3Ok1WNQ",
            "austin.2point7182.com": "austin",
            "docker.2point7182.com": "Ti2tTWCyY4HcjxfN210eK-K9TtNUlXF6q05c2APy5kI.w1zAQ9gPgNrDmg9dpMZ4_uWl023zy9-hsOmW3Ok1WNQ",
            "dustin.2point7182.com": "dustin",
            "rgauthier.2point7182.com": "rgauthier",
            "austin.careeerkoala.com": "austincc",
            "docker.careerkoala.com": "jXf1ZJ0HR4RGPuWbHdVGPv5Wrls5kzbF5Wum4DF8hqI.w1zAQ9gPgNrDmg9dpMZ4_uWl023zy9-hsOmW3Ok1WNQ",
            "dustin.careerkoala.com": "dustincc",
            "rgauthier.careerkoala.com": "ZmzQNvCPjak3u2IRHTcujxeI-AlHl1DYEs1L6mvjsF4.w1zAQ9gPgNrDmg9dpMZ4_uWl023zy9-hsOmW3Ok1WNQ"
        }

        res.send(response_table[req.get('host')])
    } catch(e){
        return res.error({description: e.message || e})
    }
})

module.exports = router
