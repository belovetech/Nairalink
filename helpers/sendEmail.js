const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST, // hostname/IP of the SMTP server used to send the email.
            service: process.env.SERVICE, // alternative to specifying host and port manually. For example, you could set service: 'gmail' to use Gmail's SMTP server.
            port: 587, // port number of the SMTP server. By default, this is set to 587 which is the standard port for secure SMTP (SMTPS)
            secure: true, // determines whether to use a secure connection when sending email. If set to true, Nodemailer will use a secure connection (TLS or SSL) to communicate with the SMTP server. If set to false, it will use an unsecured connection.
            auth: {
                user: process.env.USER, // username of the SMTP server
                pass: process.env.PASS, // password of the SMTP server
            },
        });

        await transporter.sendMail({
            from: process.env.USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;
