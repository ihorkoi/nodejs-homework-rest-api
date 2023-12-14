import nodemailer from "nodemailer";
import "dotenv/config";

const { UKR_NET_PASSWORD, UKR_NET_EMAIL_FROM } = process.env;

const config = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true, // use TLS
  auth: {
    user: UKR_NET_EMAIL_FROM,
    pass: UKR_NET_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(config)

export const sendEmail = data => {
    const email = {...data, from: UKR_NET_EMAIL_FROM};
    return transporter.sendMail(email)
}

