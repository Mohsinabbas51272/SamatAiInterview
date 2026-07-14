import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ResumeStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeService {
  private readonly logger = new Logger(ResumeService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async uploadResume(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check if resume already exists for user
    const existing = await this.prisma.resume.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    // Determine storage path
    const storagePath = file.path;

    let resume;
    if (existing) {
      // Remove old file
      if (fs.existsSync(existing.storagePath)) {
        try {
          fs.unlinkSync(existing.storagePath);
        } catch (e) {
          // ignore
        }
      }

      resume = await this.prisma.resume.update({
        where: { userId: parseInt(userId, 10) },
        data: {
          originalFileName: file.originalname,
          storagePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: ResumeStatus.PARSING,
          parsedData: null as any,
          matchScore: null,
          extractedSkills: [],
          extractedExp: null as any,
          aiAnalysis: null,
        },
      });
    } else {
      resume = await this.prisma.resume.create({
        data: {
          userId: parseInt(userId, 10),
          originalFileName: file.originalname,
          storagePath,
          fileSize: file.size,
          mimeType: file.mimetype,
          status: ResumeStatus.PARSING,
        },
      });
    }

    // Parse resume inline (no Redis/BullMQ needed)
    this.parseResumeAsync(resume.id, userId, storagePath, file.mimetype);

    return resume;
  }

  /**
   * Parse resume inline in the background (fire-and-forget).
   * This replaces the BullMQ-based queue processing.
   */
  private async parseResumeAsync(
    resumeId: string,
    userId: string,
    filePath: string,
    mimeType: string,
  ) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);

      const apiKey = this.configService.get<string>('GROQ_API_KEY');
      if (!apiKey) {
        this.logger.warn('GROQ_API_KEY not configured — saving resume as UPLOADED without parsing');
        await this.prisma.resume.update({
          where: { id: resumeId },
          data: { status: ResumeStatus.UPLOADED },
        });
        return;
      }

      // Extract text using pdf-parse if it is a PDF
      let resumeText = '';
      if (mimeType === 'application/pdf' || filePath.toLowerCase().endsWith('.pdf')) {
        try {
          const parsedPdf = await pdfParse(fileBuffer);
          resumeText = parsedPdf.text;
        } catch (pdfErr) {
          this.logger.warn(`Failed to parse PDF with pdf-parse: ${pdfErr.message}. Falling back to buffer string.`);
          resumeText = fileBuffer.toString('utf-8');
        }
      } else {
        resumeText = fileBuffer.toString('utf-8');
      }

      const prompt = `
        You are an expert AI Applicant Tracking System (ATS) and Resume Parser.
        Analyze the attached resume text and extract the key information.
        You must return a raw JSON object matching the schema below.
        Do not wrap the output in markdown block. Return ONLY valid JSON.

        Resume Content:
        """
        ${resumeText}
        """
        
        Desired JSON schema:
        {
          "skills": ["skill1", "skill2"],
          "experience": [
            {
              "company": "Company Name",
              "role": "Job Title",
              "duration": "Duration (e.g. Jan 2020 - Present)",
              "description": "Short explanation of duties"
            }
          ],
          "education": [
            {
              "institution": "University/School Name",
              "degree": "Degree (e.g. BS in Computer Science)",
              "year": "Graduation Year"
            }
          ],
          "summary": "Professional summary...",
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"],
          "yearsOfExperience": 5
        }
      `;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert ATS (Applicant Tracking System) parser. Your task is to extract resume data and return a valid JSON object matching the requested schema.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.choices?.[0]?.message?.content;

      if (!textResponse) {
        throw new Error('Empty response from Groq AI');
      }

      const parsedData = JSON.parse(textResponse.trim());
      const skills = parsedData.skills || [];
      const yearsOfExp = parsedData.yearsOfExperience || 0;
      const experienceJson = parsedData.experience || [];

      // Save parsed data
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: ResumeStatus.PARSED,
          parsedData: parsedData,
          extractedSkills: skills,
          extractedExp: experienceJson,
          aiAnalysis: parsedData.summary,
        },
      });

      // Update profile if it exists
      try {
        await this.prisma.profile.update({
          where: { userId: parseInt(userId, 10) },
          data: {
            skills: { set: skills },
            yearsOfExperience: yearsOfExp,
            bio: parsedData.summary,
          },
        });
      } catch (profileErr) {
        this.logger.warn(`Could not update profile for userId ${userId}: ${profileErr.message}`);
      }

      this.logger.log(`Successfully parsed resume for userId: ${userId}`);
    } catch (error) {
      this.logger.error(`Resume parsing failed for userId ${userId}: ${error.message}`);
      
      try {
        await this.prisma.resume.update({
          where: { id: resumeId },
          data: {
            status: ResumeStatus.FAILED,
            aiAnalysis: `Parsing failed: ${error.message}`,
          },
        });
      } catch (dbErr) {
        this.logger.error(`Failed to update resume status: ${dbErr.message}`);
      }
    }
  }

  async getResume(userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    if (!resume) {
      return null; // Return null — frontend handles the empty state
    }

    return resume;
  }

  async deleteResume(userId: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    // Delete file
    if (fs.existsSync(resume.storagePath)) {
      try {
        fs.unlinkSync(resume.storagePath);
      } catch (e) {
        // ignore
      }
    }

    await this.prisma.resume.delete({
      where: { userId: parseInt(userId, 10) },
    });

    return { success: true, message: 'Resume deleted successfully' };
  }
}
