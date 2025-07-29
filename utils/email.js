const nodemailer = require('nodemailer');
const logger = require('./logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  async sendIncidentAlert(incident, recipients) {
    try {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: recipients.join(', '),
        subject: `🚨 New Incident Alert: ${incident.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">New Incident Reported</h2>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
              <p><strong>Title:</strong> ${incident.title}</p>
              <p><strong>Category:</strong> ${incident.category}</p>
              <p><strong>Severity:</strong> ${incident.severity}</p>
              <p><strong>Location:</strong> ${incident.location?.building || 'N/A'}</p>
              <p><strong>Reported By:</strong> ${incident.reportedBy.fullName}</p>
              <p><strong>Date:</strong> ${new Date(incident.dateTimeOccurred).toLocaleString()}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${process.env.CLIENT_URL}/incidents/${incident._id}" 
                 style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Incident Details
              </a>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Incident alert email sent for incident: ${incident._id}`);
    } catch (error) {
      logger.error('Error sending incident alert email:', error);
    }
  }

  async sendTrainingReminder(training, user) {
    try {
      const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: user.email,
        subject: `📚 Training Reminder: ${training.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Training Reminder</h2>
            <p>Hello ${user.firstName},</p>
            <p>This is a reminder that you have a pending training assignment:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
              <p><strong>Training:</strong> ${training.title}</p>
              <p><strong>Category:</strong> ${training.category}</p>
              <p><strong>Duration:</strong> ${training.duration} minutes</p>
              <p><strong>Due Date:</strong> ${new Date(training.schedule.endDate).toLocaleDateString()}</p>
            </div>
            <p style="margin-top: 20px;">
              <a href="${process.env.CLIENT_URL}/training/${training._id}" 
                 style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Start Training
              </a>
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Training reminder email sent to: ${user.email}`);
    } catch (error) {
      logger.error('Error sending training reminder email:', error);
    }
  }
}

module.exports = new EmailService();