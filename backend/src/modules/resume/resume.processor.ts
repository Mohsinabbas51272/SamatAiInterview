import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ResumeStatus } from '@prisma/client';
import * as fs from 'fs';
import { Logger } from '@nestjs/common';

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

      // Convert file to base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');

      // Call Gemini AI REST API
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }

      const prompt = `
        You are an expert AI Applicant Tracking System (ATS) and Resume Parser.
        Analyze the attached resume and extract the key information.
        You must return a raw JSON object matching the schema below.
        Do not wrap the output in markdown block. Return ONLY valid JSON.
        
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

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: mimeType || 'application/pdf',
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('Empty response from Gemini AI');
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
