var nodemailer = require('nodemailer');
var FCM = require('fcm-node');

module.exports = {
    weekEnd:6,
    secretKey: 'secret',
    session_expiry: 30,
    api_authentication: false,
    token_expiresIn: { expiresIn: 3000 }
}
module.exports.res = {
    desc_sep: '|'
}
module.exports.paymentRedirectUrl = {
    // web: 'https://firstchoize.com/#/paymentstatus',
    // phone: 'https://firstchoize.com:8000/payment-success'
}
module.exports.keys = {
    
}
module.exports.validation = {

}
module.exports.error_msg_on_mandatory = {

}
module.exports.mail_transporter = nodemailer.createTransport({
    service: 'yandex',
    port: 582,
    secure: true,
    auth: {
        user: 'noreply@objectivedone.com',
        pass: 'Password@123'
    }
});
// module.exports.responses = {
//     id_not_found: {
//         statuscode: 402,
//         status: 'error',
//         msg: 'Team Id not found'
//     }

// }
module.exports.fcm = new FCM('AAAALQQcLCc:APA91bEBQ-VvGRhzwTbBCksPd7ZOtVPP90KhbHlIXH4LYo8wLkFlWDqBgFdIkUAG76AjHAlhxf8vsSDcDS5QvSoXrwgTzJWumcSovj3Xz35697IJuoyTscgvSiMX2cxrXfb1e2fIop0d');