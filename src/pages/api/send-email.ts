import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import archiver from 'archiver';
import nodemailer from 'nodemailer';
import SibApiV3Sdk from 'sib-api-v3-sdk';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Verify required environment variables
const requiredEnvVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM_EMAIL',
  'SMTP_FROM_NAME',
  'BREVO_API_KEY',
  'BREVO_SENDER_EMAIL',
  'BREVO_SENDER_NAME'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
  }
});

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// SMTP Configuration as fallback
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

function prepareEmailTemplate(fileCount: number, message?: string) {
  const currentDate = new Date().toLocaleDateString();
  const gradientColors = 'linear-gradient(135deg, #6366f1, #141249)';
  const accentColor = '#6366f1';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Files Are Ready</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; color: #333333;">
        <div style="max-width: 600px; margin: 20px auto; padding: 0; text-align: center; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <div style="background: ${gradientColors}; color: #ffffff; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">Your Files Have Been Delivered</h1>
            </div>
            <div style="background-color: #121212; color: #ffffff; padding: 25px; text-align: left; border-radius: 0 0 10px 10px;">
                <h2 style="font-size: 20px; color: ${accentColor};">Dear Recipient,</h2>
                <p style="margin: 0 0 15px; color: #ffffff;">
                    The files you requested through <strong style="color: ${accentColor};">XyloMail</strong> have been successfully processed and are attached to this email.
                </p>
                <div style="background-color: #1e1e1e; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="margin: 5px 0; color: #cccccc;"><strong>Date Processed:</strong> ${currentDate}</p>
                    <p style="margin: 5px 0; color: #cccccc;"><strong>Number of Files:</strong> ${fileCount}</p>
                    <p style="margin: 5px 0; color: #cccccc;"><strong>File Package:</strong> Delivered as a single ZIP archive.</p>
                </div>
                <p style="margin-bottom: 5px; color: ${accentColor};">Message from the sender:</p>
                <blockquote style="font-style: italic; color: #dddddd; border-left: 4px solid ${accentColor}; padding-left: 10px; margin: 10px 0;">
                    ${message || "No message has been provided."}
                </blockquote>
                <p style="margin: 15px 0; font-size: 14px; color: #cccccc;">
                    Thank you for choosing <strong style="color: ${accentColor};">XyloMail</strong>. We aim to make your file transfers simple, secure, and seamless.
                </p>
                <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #cccccc;">
                    <p style="margin: 0;">&copy; 2025 <strong style="color: ${accentColor};">XyloSync</strong>. All rights reserved.</p>
                    <p style="margin: 0;">Secure file sharing, powered by <strong style="color: ${accentColor};">XyloSync</strong>.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

function parseForm(req: NextApiRequest): Promise<{
  emails: string[];
  message: string;
  files: File[];
}> {
  const form = formidable({ 
    multiples: true, 
    keepExtensions: true,
    maxFileSize: 4.5 * 1024 * 1024 // 4.5MB limit
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      
      try {
        const emails = JSON.parse(Array.isArray(fields.emails) ? fields.emails[0] : (fields.emails || '[]'));
        const message = Array.isArray(fields.message) ? fields.message[0] : (fields.message || '');
        const uploadedFiles = files.files ? 
          (Array.isArray(files.files) ? files.files : [files.files]) : [];
        
        resolve({ emails, message, files: uploadedFiles });
      } catch (error) {
        reject(error);
      }
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { emails, message, files } = await parseForm(req);

    if (!emails || emails.length === 0 || !files || files.length === 0) {
      return res.status(400).json({ error: 'Email(s) and files are required.' });
    }

    if (emails.length > 5) {
      return res.status(400).json({ error: 'Maximum 5 recipients allowed.' });
    }

    console.log('Preparing to send email to:', emails);
    console.log('Number of files:', files.length);

    // Create zip buffer in memory
    const archive = archiver('zip', { store: true });
    const chunks: Buffer[] = [];
    
    archive.on('data', chunk => chunks.push(chunk));

    const zipPromise = new Promise<Buffer>((resolve, reject) => {
      archive.on('end', () => {
        const zipBuffer = Buffer.concat(chunks);
        resolve(zipBuffer);
      });
      archive.on('error', reject);
    });

    // Add files to archive
    files.forEach(file => {
      if (file.filepath && fs.existsSync(file.filepath)) {
        archive.append(fs.createReadStream(file.filepath), { 
          name: file.originalFilename || 'file' 
        });
      }
    });

    await archive.finalize();
    const zipBuffer = await zipPromise;
    
    const timestamp = new Date().toISOString().split('T')[0];
    const zipFileName = `XyloMail_Files_${timestamp}.zip`;
    const htmlTemplate = prepareEmailTemplate(files.length, message);

    // Send emails in parallel
    const sendEmailPromises = emails.map(async (recipientEmail: string) => {
      try {
        // Try Brevo first
        try {
          console.log('Attempting to send via Brevo to:', recipientEmail);
          const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
          
          sendSmtpEmail.sender = {
            name: process.env.BREVO_SENDER_NAME || 'XyloMail',
            email: process.env.BREVO_SENDER_EMAIL || ''
          };
          sendSmtpEmail.to = [{ email: recipientEmail }];
          sendSmtpEmail.subject = "Your Files Are Ready";
          sendSmtpEmail.htmlContent = htmlTemplate;
          sendSmtpEmail.attachment = [{
            name: zipFileName,
            content: zipBuffer.toString('base64')
          }];

          const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
          console.log(`Email sent via Brevo to ${recipientEmail}`);
          return { success: true, email: recipientEmail, messageId: data.messageId };
        } catch (brevoError) {
          console.error('Brevo error:', brevoError);
          console.log(`Brevo failed, using SMTP fallback for ${recipientEmail}`);
          
          // Fallback to SMTP
          const mailOptions = {
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
            to: recipientEmail,
            subject: 'Your Files Are Ready',
            html: htmlTemplate,
            attachments: [{ filename: zipFileName, content: zipBuffer }]
          };

          const info = await transporter.sendMail(mailOptions);
          console.log(`Email sent via SMTP fallback to ${recipientEmail}`);
          return { success: true, email: recipientEmail, messageId: info.messageId };
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Failed to send email to ${recipientEmail}:`, error);
        return { success: false, email: recipientEmail, error: errorMessage };
      }
    });

    const results = await Promise.all(sendEmailPromises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = emails.length - successCount;

    if (successCount === 0) {
      res.status(500).json({ error: 'Failed to send all emails' });
    } else if (failureCount > 0) {
      res.json({ 
        partialSuccess: true,
        message: `Successfully sent to ${successCount} out of ${emails.length} recipients`,
        results
      });
    } else {
      res.json({ 
        success: true, 
        message: `Successfully sent to all ${successCount} recipients`,
        results
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Server error occurred',
      details: errorMessage 
    });
  }
}
