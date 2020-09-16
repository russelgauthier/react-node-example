/**
 * Author: Russel Gauthier(c) <russel@russelgauthier.com> - All Rights Reserved
 *
 * Consult LICENCE file for more details
 *
 **/
const delayResponse = (responseFnc, milliseconds) => {
    setTimeout(() => {
        responseFnc()
    }, milliseconds)
}

module.exports = {delayResponse}
