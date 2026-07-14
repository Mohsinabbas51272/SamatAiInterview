const { PrismaClient } = require('@prisma/client');


const prisma = new PrismaClient();

const interviewId = 'aba22319-16ce-4227-b4f0-f8d783321671';
const apiKey = process.env.GROQ_API_KEY || '';

async function run() {
  console.log('Starting migration to complete interview...');
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      job: true,
      candidate: {
        include: {
          resume: true
        }
      }
    }
  });

  if (!interview) {
    console.error('Interview not found');
    process.exit(1);
  }

  console.log(`Found interview for job: ${interview.job.title}`);

  const answers = await prisma.interviewAnswer.findMany({
    where: { interviewId }
  });

  if (answers.length === 0) {
    console.error('No answers found');
    process.exit(1);
  }

  console.log(`Found ${answers.length} answers`);

  const avgScore = answers.reduce((sum, a) => sum + (a.score || 0), 0) / answers.length;
  const techScore = avgScore;
  const commScore = Math.min(100, avgScore + 5);
  const confidenceScore = Math.min(100, avgScore - 2);

  const answersSummary = answers
    .map((a, idx) => `Q${idx + 1}: ${a.answerText}\nScore: ${a.score}\nFeedback: ${a.aiFeedback}`)
    .join('\n\n');

  const prompt = `
    Synthesize the overall performance report for the candidate applying for "${interview.job.title}".
    Below are the candidate's answers and their question-level grades:
    ${answersSummary}

    Overall Score is: ${avgScore}/100.
    
    Generate strengths, weaknesses, a final recommendation (e.g. STRONG_HIRE, HIRE, BORDERLINE, REJECT) and a professional NLP summary analysis.
    Return as a valid JSON object matching the schema below (Do not include markdown):
    {
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendation": "STRONG_HIRE",
      "analysis": "A brief overview of their demeanor, expertise, and matching fit."
    }
  `;

  console.log('Calling Groq API to generate report...');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert AI interviewer evaluator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`API Call failed: ${response.status} - ${errText}`);
    process.exit(1);
  }

  const resJson = await response.json();
  const rawText = resJson.choices?.[0]?.message?.content;
  console.log('Groq API Response content received:', rawText);

  const reportData = JSON.parse(rawText.trim());

  console.log('Saving completed interview status...');
  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      status: 'COMPLETED',
      overallScore: avgScore,
      technicalScore: techScore,
      communicationScore: commScore,
      confidenceScore: confidenceScore
    }
  });

  console.log('Creating report record...');
  const report = await prisma.report.create({
    data: {
      interviewId,
      candidateId: interview.candidateId,
      resumeScore: interview.candidate.resume?.matchScore || 80,
      interviewScore: avgScore,
      confidenceScore: confidenceScore,
      communicationScore: commScore,
      technicalScore: techScore,
      overallScore: (avgScore + (interview.candidate.resume?.matchScore || 80)) / 2,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendation: reportData.recommendation,
      nlpAnalysis: reportData.analysis
    }
  });

  console.log('Updating application status...');
  try {
    const application = await prisma.application.findFirst({
      where: {
        jobId: interview.jobId,
        candidateId: interview.candidateId
      }
    });

    if (application) {
      await prisma.application.update({
        where: { id: application.id },
        data: { status: 'INTERVIEW_COMPLETED' }
      });
      console.log('Application status updated successfully');
    }
  } catch (e) {
    console.error('Failed to update application status:', e.message);
  }

  console.log('✅ Success! Interview record has been completed and report is generated.');
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
