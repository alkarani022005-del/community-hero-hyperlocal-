const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeIssue(title, description) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an AI assistant for a civic issue reporting platform in India.
Analyze this reported community issue and respond ONLY in valid JSON with no extra text.

Issue Title: "${title}"
Issue Description: "${description}"

Return exactly this JSON:
{
  "category": one of ["Pothole", "Water Leakage", "Streetlight", "Garbage", "Encroachment", "Other"],
  "severity": one of ["Low", "Medium", "High", "Critical"],
  "department": "the Indian govt department that handles this e.g. PWD, Municipal Corporation, Electricity Board",
  "aiSummary": "a formal 2-sentence complaint to send to authorities"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini error:', err.message);
    return {
      category: 'Other',
      severity: 'Medium',
      department: 'Municipal Corporation',
      aiSummary: description,
    };
  }
}

module.exports = { analyzeIssue };