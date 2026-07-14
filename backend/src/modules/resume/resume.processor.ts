import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ResumeStatus } from '@prisma/client';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

@Processor('resume-parsing')
export class ResumeProcessor extends WorkerHost {
  private readonly logger = new Logger(ResumeProcessor.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { resumeId, userId, filePath, mimeType } = job.data;
    this.logger.log(`Processing resume parsing for userId: ${userId}, resumeId: ${resumeId}`);

    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);

      // Call Groq API REST API
      const apiKey = this.configService.get<string>('GROQ_API_KEY');
      if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured');
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
        throw new Error(`Groq API returned error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.choices?.[0]?.message?.content;

      if (!textResponse) {
        throw new Error('Empty response from Groq AI');
      }

      // Parse JSON from text
      const parsedData = JSON.parse(textResponse.trim());

      const skills = parsedData.skills || [];
      const yearsOfExp = parsedData.yearsOfExperience || 0;
      const experienceJson = parsedData.experience || [];

      // Save to database
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

      // Also update candidate's profile with skills and years of experience if available
      try {
        await this.prisma.profile.update({
          where: { userId: parseInt(userId, 10) },
          data: {
            skills: {
              set: skills,
            },
            yearsOfExperience: yearsOfExp,
            bio: parsedData.summary,
          },
        });
      } catch (profileError) {
        this.logger.warn(`Could not update profile for userId ${userId}: ${profileError.message}`);
      }

      this.logger.log(`Successfully parsed resume for userId: ${userId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error parsing resume for userId ${userId}: ${error.message}`, error.stack);
      
      await this.prisma.resume.update({
        where: { id: resumeId },
        data: {
          status: ResumeStatus.FAILED,
          aiAnalysis: `Parsing failed: ${error.message}`,
        },
      });

      throw error;
    }
  }
}
