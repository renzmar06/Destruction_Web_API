import nodemailer from 'nodemailer';
import MailConfig from '@/models/MailConfig';
import { connectDB } from '@/lib/mongodb';

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    await connectDB();
    
    // Get active mail configuration
    const mailConfig = await MailConfig.findOne({ is_active: true });
    if (!mailConfig) {
      throw new Error('No active mail configuration found');
    }

    console.log('Mail config found:', {
      host: mailConfig.host,
      port: mailConfig.port,
      username: mailConfig.username ? 'present' : 'missing',
      password: mailConfig.password ? 'present' : 'missing',
      rawConfig: mailConfig
    });

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: false,
      requireTLS: true,
      auth: {
        user: mailConfig.username || mailConfig.get('username'),
        pass: mailConfig.password || mailConfig.get('password'),
      },
    });

    // Send email
    const result = await transporter.sendMail({
      from: `${mailConfig.from_name} <${mailConfig.from_address}>`,
      to,
      subject,
      html,
    });

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}