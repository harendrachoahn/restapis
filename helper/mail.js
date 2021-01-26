const nodemailer = require("nodemailer");

exports.sendMail = async function (to, subject, content) {
    try {        
        //mail configuration by gmail
        var transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: 'harendra.debut@gmail.com',
                pass: 'harendra.debut@123'
            }
        });
        let mailOptions = {
            from: '"Rest APIs" <harendra.debut@yopmail.com>', 
            to: to,
            subject: subject,
            text: content,
            html: content // html body
        }

        // send mail with defined transport object
        let info = await transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
        });
        
    }
    catch (err) {
        return err;
    }
}
