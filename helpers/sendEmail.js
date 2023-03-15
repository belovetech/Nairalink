const nodemailer = require("nodemailer");
const MailSlurp = require('mailslurp-client').default;
const apiKey = process.env.API_KEY
const mailslurp = new MailSlurp({ apiKey });

const sendEmail = async (email, subject, text) => {
    const inbox = await mailslurp.createInboxWithOptions({
        inboxType: "SMTP_INBOX"
      });
    const server = await mailslurp.inboxController.getImapSmtpAccess({
        inboxId: inbox.id,
      });

    try {
        // Create auth plain transport
        const transport = nodemailer.createTransport({
            host: server.smtpServerHost,
            port: server.smtpServerPort,
            secure: false,
            auth: {
                user: server.smtpUsername,
                pass: server.smtpPassword,
                type: 'PLAIN',
            },
        });
        // Send email
        const sent = await transport.sendMail({
            from: inbox.emailAddress,
            to: `${inbox.emailAddres},${email}`,
            subject: subject,
            text: text,
            html: '<b>Hello world</b>',
        });

        console.log("sent details: ", sent);
        console.log("email sent sucessfully");
    } catch (error) {
        console.log(error, "email not sent");
    }
};

module.exports = sendEmail;
