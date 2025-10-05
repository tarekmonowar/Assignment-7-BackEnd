import nodemailer from "nodemailer";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

// HTML escape to prevent XSS
const escapeHTML = (str: string): string => {
  return str.replace(
    /[&<>"']/g,
    (match) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        match
      ]!),
  );
};

// Capitalize first letter of each word
const formatName = (str: string): string => {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

// Validate email format
const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Validate string length
const isNonEmptyString = (value: any): boolean =>
  typeof value === "string" && value.trim().length > 0;

// Configure transporter securely
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS,
  },
  tls:
    process.env.NODE_ENV === "development"
      ? { rejectUnauthorized: false }
      : undefined,
});

export const postContact = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, phoneNumber, message, service } = req.body;

    // Validation: required fields
    if (
      !isNonEmptyString(name) ||
      !isValidEmail(email) ||
      !isNonEmptyString(message)
    ) {
      res.status(400).json({
        success: false,
        message: "Name, email, and message are required and must be valid.",
      });
    }

    // Sanitize user inputs
    const safeName = escapeHTML(formatName(name));
    const safeEmail = escapeHTML(email);
    const safePhone = phoneNumber ? escapeHTML(phoneNumber) : "";
    const safeMessage = escapeHTML(message);
    const safeService = service ? escapeHTML(service) : "";

    // Admin HTML
    const adminHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container {
            width: 95% !important;
            padding: 10px !important;
          }
        }
      </style>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #e9ecef;">
      <div class="container" style="max-width: 900px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
        <div style="background-color: #2c3e50; color: #ffffff; padding: 20px;">
          <h2 style="margin: 0; font-size: 20px;">📬 New Contact Form Submission</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff;">
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Name:</td>
            <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Email:</td>
            <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${safeEmail}</td>
          </tr>
          <tr>
            <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Phone:</td>
            <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${safePhone}</td>
          </tr>
          ${
            safeService
              ? `<tr>
                  <td style="padding: 12px; font-weight: bold; border-bottom: 1px solid #f0f0f0;">Service:</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f0f0f0;">${safeService}</td>
                </tr>`
              : ""
          }
          <tr>
            <td style="padding: 12px; font-weight: bold;">Message:</td>
            <td style="padding: 12px;">${safeMessage}</td>
          </tr>
        </table>
        <div style="padding: 15px; text-align: center; font-size: 12px; color: #777;">
          This message was sent via your website contact form.
        </div>
      </div>
    </body>
    </html>
    `;

    const userHtml = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body
    style="
      margin: 0;
      padding: 20px 0;
      background-color: rgba(0, 0, 0, 0.1);
      font-family: Arial, sans-serif;
    "
  >
    <div
      style="
        background: linear-gradient(
          130deg,
          #ff5618,
          #21c83a 41.07%,
          #c2611cb0 76.05%
        );
        max-width:80%;
        margin: 40px auto;
        border-radius: 10px;
        overflow: hidden;
        padding: 2px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      "
    >
      <div style="border-radius: 10px">
        <!-- Header with Icon -->
        <div
          style="
            background-color: #2c3e50;
            color: white;
            padding: 30px;
            padding-top: 40px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          "
        >
          <h1 style="margin: 0; font-size: 35px"> 📬Thank You, <span style="color: chartreuse">${safeName} !</span></h1>
          <p style="margin:10px 0 0 3px; font-size: 17px ; color:white">
            I've received your message
          </p>
        </div>

      
        <div
          style="padding: 10px 25px 8px 25px; background-color: #ffffff; color: black"
        >
          <p style="margin-bottom:25px; font-size: 19px">
            Dear
            <strong style="color: #ce2cda">${safeName}</strong>,
          </p>
          <p style="font-size: 17px ; color:black">
            Thank you for reaching out to me—I truly appreciate your message. I
            will carefully review it and get back to you as soon as possible.
          </p>
          <p style="font-size: 17px ; color:black">
            I'm committed to providing you with the best service and support. If
            you have any urgent questions or need immediate assistance, feel
            free to contact me directly.
          </p>

          <p style="margin-top: 25px; font-size: 15px">
            Best regards,<br /><strong>Tarek Monowar</strong>
          </p>
        </div>

       
         <div
          style="
            background-color: #2d3b58;
            padding: 10px;
            padding-top: 20px;
            text-align: center;
            font-size: 13px;
            color: white;
            border-radius: 0 0 10px 10px;
          "
        >
          <p style="font-size: 13px  ">
            Visit Me:
            <span style="color:chartreuse;"
              >tarekmonowar.vercel.appss</span>
          </p>
          <p style="font-size: 15px;color:white;">
            Feel free to explore my Portfolio to see the projects I've worked on
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
    `;

    // Email options
    const adminMailOptions = {
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_RECEIVER,
      subject: "New Contact Form Submission",
      html: adminHtml,
      text: `New submission:
       Name: ${safeName}
       Email: ${safeEmail}
       Phone: ${safePhone || "N/A"}
       ${safeService ? `Service: ${safeService}` : ""}
       Message: ${safeMessage}`,
    };

    const userMailOptions = {
      from: process.env.EMAIL_SENDER,
      to: safeEmail,
      subject: "Thank you for your submission",
      html: userHtml,
      text: `Dear ${safeName},

     Thank you for contacting us! We received your message and will get back to you shortly.

     Best regards,
     Tarek Monowar`,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res
      .status(200)
      .json({ success: true, message: "Emails sent successfully." });
  } catch (error: unknown) {
    console.error("Email sending error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      success: false,
      message: "Failed to send emails.",
      error: errorMessage,
    });
  }
};
