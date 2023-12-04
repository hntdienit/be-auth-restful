import { envLib } from "@/libs/env";
import nodeMailer from "nodemailer";

export const sendEMail = (to: any, subject: any, htmlContent: any) => {
  const transporter = nodeMailer.createTransport({
    host: envLib.mail.host,
    port: +envLib.mail.port,
    auth: {
      user: envLib.mail.user,
      pass: envLib.mail.password,
    },
  });

  const mailOptions = {
    from: envLib.mail.mailFrom,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
