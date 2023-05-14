const nodeMailer = require('nodemailer');

exports.sendEmail = async(options)=>{
    const transporter = nodeMailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "f17a10dea5d86d",
            pass: "eddc178dd47c57"
        }
        /*
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD,
        },
        service:process.env.SMTP_SERVICE,*/
    });

    const mailOptions ={
        from:process.env.SMTP_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message,
    }

    await transporter.sendMail(mailOptions);
}