import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function parseEmailForLeave(emailContent: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract leave request details from this email: "${emailContent}". 
    Return JSON with fields: type (sick, vacation, personal), start_date (YYYY-MM-DD), end_date (YYYY-MM-DD), reason.`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text);
}

export async function getHRAssistantResponse(query: string, context: any) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are an HR Assistant. Context: ${JSON.stringify(context)}. User query: "${query}". 
    Provide a helpful, professional response based on the context.`,
  });
  return response.text;
}
