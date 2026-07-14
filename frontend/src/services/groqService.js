// Groq AI Service for Smart Interview Agent
// Provides AI-powered interview question generation and response evaluation

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Send a prompt to Groq and get a text response
 */
export async function askGroq(prompt, options = {}) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: options.model || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are Aria, an AI technical recruiter. Analyze candidates answers objectively and constructively.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 512,
        response_format: options.jsonMode ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Groq API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return text || null;
  } catch (err) {
    console.warn('Groq API call failed:', err);
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

  return askGroq(prompt, { maxTokens: 150, temperature: 0.6 });
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

  const result = await askGroq(prompt, { maxTokens: 400, temperature: 0.4, jsonMode: true });
  if (!result) return null;

  try {
    // Strip any markdown code fences if present
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    console.warn('Failed to parse Groq evaluation JSON:', result);
    return null;
  }
}
