import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('MAIL_HOST');
    const port = this.configService.get<number>('MAIL_PORT');
    const user = this.configService.get<string>('MAIL_USER');
    const pass = this.configService.get<string>('MAIL_PASSWORD');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('SMTP Mailer transporter initialized successfully.');
    } else {
      this.logger.warn('SMTP Mailer credentials missing. Running in MOCK Mode.');
    }
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    const from = this.configService.get<string>('MAIL_FROM') || 'noreply@smartinterview.ai';
    
    this.logger.log(`[Email Dispatch] Sending to: ${to} | Subject: ${subject}`);
    
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to,
          subject,
          text,
          html: html || text,
        });
        this.logger.log(`SMTP Email successfully sent to ${to}`);
        return true;
      } catch (err) {
        this.logger.error(`Failed to send SMTP email to ${to}: ${err.message}`, err.stack);
        // Fallback to mock log
      }
    }
    
    // Mock logging
    this.logger.log(`[MOCK EMAIL SENT SUCCESS]
    To: ${to}
    From: ${from}
    Subject: ${subject}
    Body: ${text}`);
    return true;
  }
}
