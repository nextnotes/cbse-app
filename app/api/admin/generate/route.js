import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a CBSE curriculum content writer for Indian school students (Std 6-10).
Given a topic or source text, produce study material as STRICT JSON with this exact shape and nothing else (no markdown fences, no preamble):
{
  "notes":"string",
  "practice_questions":[{"question":"string","options":["a","b","c","d"],"answer":"string","explanation":"string"}],
  "mindmap":{"title":"string","children":[]}
}`;

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error:'GEMINI_API_KEY is not set.'},{status:500});
  }
  const { mode, grade, subject, chapter, topic, sourceText } = await request.json();
  const userPrompt = mode==='source'
  ? `Grade: ${grade}, Subject: ${subject}, Chapter: ${chapter||'(untitled)'}\n\n${sourceText}`
  : `Grade: ${grade}, Subject: ${subject}, Chapter: ${chapter||topic}\nGenerate CBSE study material for "${topic}".`;

  try{
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents:[{parts:[{text:SYSTEM_PROMPT+"\n\n"+userPrompt}]}]
      })
    });
    const data=await response.json();
    if(!response.ok) throw new Error(JSON.stringify(data));
    const text=data.candidates?.[0]?.content?.parts?.[0]?.text||'';
    const cleaned=text.replace(/```json|```/g,'').trim();
    return NextResponse.json(JSON.parse(cleaned));
  }catch(err){
    return NextResponse.json({error:'Failed to generate content: '+err.message},{status:500});
  }
}
