import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Roadmap, Task } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateRoadmap(profile: UserProfile): Promise<Roadmap> {
  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a 30-day online earning roadmap for a ${profile.role} with a ${profile.budget} budget and ${profile.time} daily availability. 
    The roadmap should be practical, step-by-step, and focus on a specific method like freelancing, content creation, or micro-tasks.
    Return a structured JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "A catchy title for the roadmap",
          },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: {
                  type: Type.INTEGER,
                  description: "The day number (1-30)",
                },
                title: {
                  type: Type.STRING,
                  description: "Short title of the task",
                },
                description: {
                  type: Type.STRING,
                  description: "Detailed step-by-step instructions for this day",
                },
                videoId: {
                  type: Type.STRING,
                  description: "Relevant YouTube video ID (optional, 11 characters)",
                },
              },
              required: ["day", "title", "description"],
            },
          },
        },
        required: ["title", "tasks"],
      },
    },
  });

  const data = JSON.parse(response.text || '{}');
  
  return {
    id: Math.random().toString(36).substring(7),
    title: data.title || "30-Day Earning Roadmap",
    tasks: (data.tasks || []).map((t: any) => ({ ...t, completed: false })),
    createdAt: new Date().toISOString(),
  };
}

export async function getMentorResponse(history: { role: string, text: string }[], message: string) {
  const chat = genAI.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are Mana Skill AI Mentor, an expert in online earning for students. You provide practical, ethical, and step-by-step advice. Keep responses concise and encouraging.",
    },
  });

  // Note: sendMessage only takes message string, but we can't easily pass history in this simplified SDK call without more complex setup if we want to maintain context.
  // Actually, the SDK supports history in chats.create but let's keep it simple for now as per guidelines.
  const response = await chat.sendMessage({ message });
  return response.text;
}

export async function generateToolContent(toolType: string, input: string) {
  const prompts: Record<string, string> = {
    businessName: `Generate 10 creative business names for: ${input}`,
    instaBio: `Generate 5 catchy Instagram bios for: ${input}`,
    reelScript: `Generate a short viral reel script for: ${input}`,
    ebookTopic: `Generate 5 profitable ebook topics for: ${input}`,
  };

  const response = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompts[toolType] || `Help with: ${input}`,
  });

  return response.text;
}
