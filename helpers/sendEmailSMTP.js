const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const MailSlurp = require('mailslurp-client').default
const apiKey = process.env.API_KEY
const mailslurp = new MailSlurp({ apiKey })

const sendEmailSMTP = async (email, subject, payload, template) => {
  try {
    const inbox = await mailslurp.createInboxWithOptions({
      inboxType: 'SMTP_INBOX',
    })
    const server = await mailslurp.inboxController.getImapSmtpAccess({
      inboxId: inbox.id,
    })
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
    })

    const source = fs.readFileSync(path.join(__dirname, template), 'utf8')
    const compiledTemplate = handlebars.compile(source)
    const options = () => {
      return {
        from: inbox.emailAddress,
        to: `${inbox.emailAddres},${email}`,
        subject: subject,
        html: compiledTemplate(payload),
      }
    }

    // Send email
    transport.sendMail(options(), (error, info) => {
      if (error) return error
      else
        return res.status(200).json({
          success: true,
          info,
        })
    })
  } catch (error) {
    return error
  }
}

module.exports = sendEmailSMTP
