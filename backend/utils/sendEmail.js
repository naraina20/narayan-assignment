const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE, 
      auth: {
        user: process.env.SMPT_MAIL, 
        pass: process.env.SMPT_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"Narayan 👨‍💻" <naakiyod20@gmail.com>`, 
      to,        
      subject,   
      html
    });

    console.log('Email sent to : ', to);
    return info;
  } catch (err) {
    console.error('Email sending error:', err);
  }
};
