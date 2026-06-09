// Google Gemini AI Service for Smart Interview Agent
// Provides AI-powered interview question generation and response evaluation

const GEMINI_API_KEY = 'AIzaSyDsz6I8Ru0Z-XC53tehgjoyifMvXzL6_i8';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Send a prompt to Gemini and get a text response
 */
export async function askGemini(prompt, options = {}) {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 512,
          topP: 0.95,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Gemini API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (err) {
    console.warn('Gemini API call failed:', err);
    return null;
  }
}

/**
 * Generate an AI follow-up comment based on the candidate's answer
 */
export async function evaluateAnswer(question, answer) {
  const prompt = `You are Aria, a professional AI technical recruiter at a top tech company. 
A candidate was asked: "${question}"
They answered: "${answer}"

Give a brief 1-2 sentence professional follow-up acknowledgment of their answer before transitioning to the next question. Be encouraging but objective. Keep it concise and natural.`;

  return askGemini(prompt, { maxTokens: 150, temperature: 0.6 });
}

/**
 * Generate an AI-powered evaluation summary for a candidate's overall performance
 */
export async function generateEvaluationSummary(candidateName, questionsAndAnswers) {
  const qaText = questionsAndAnswers
    .map(({ q, a }, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${a}`)
    .join('\n\n');

  const prompt = `You are an AI recruitment evaluation engine. Analyze this technical interview transcript for candidate "${candidateName}" applying for a Senior React Developer role.

Interview Transcript:
${qaText}

Provide a professional evaluation in this exact JSON format (no markdown, just raw JSON):
{
  "nlpAnalysis": "2-3 sentence NLP linguistics analysis of their communication patterns",
  "communicationScore": <number 1-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendation": "1 sentence final recommendation"
}`;

  const result = await askGemini(prompt, { maxTokens: 400, temperature: 0.4 });
  if (!result) return null;

  try {
    // Strip any markdown code fences if present
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn('Failed to parse Gemini evaluation JSON:', result);
    return null;
  }
}
