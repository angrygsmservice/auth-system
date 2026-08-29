const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  console.log("========== SEND EMAIL START ==========");
  console.log("EMAIL KIMGA:", to);
  console.log("EMAIL USER:", process.env.EMAIL_USER);

  await transporter.verify();

  console.log("SMTP ULANDI");

  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  });

  console.log("========== EMAIL YUBORILDI ==========");
  console.log("MESSAGE ID:", info.messageId);
  console.log("ACCEPTED:", info.accepted);
  console.log("REJECTED:", info.rejected);
  console.log("RESPONSE:", info.response);

  return info;
};

module.exports = sendEmail;