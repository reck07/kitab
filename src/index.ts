<<<<<<< HEAD
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests for browser calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, format, prompt } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY")

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.")
    }

    let instruction = ""
    if (format === 'summary') {
      instruction = "Summarize this note and extract 3 key bullet points:\n\n"
    } else if (format === 'flashcards') {
      instruction = "Create 3 study flashcards based on this note. Format as Q: [Question] A: [Answer]:\n\n"
    } else if (format === 'quiz') {
      instruction = "Create a short 3-question multiple-choice quiz based on this note:\n\n"
    } else if (format === 'ask') {
      instruction = `Answer the following question or request: "${prompt}" based ONLY on this note:\n\n`
    } else {
      instruction = "Process this note:\n\n"
    }

    const finalPrompt = instruction + content
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const aiText = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ result: aiText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests for browser calls
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { content, format, prompt } = await req.json()
    const apiKey = Deno.env.get("GEMINI_API_KEY")

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set.")
    }

    let instruction = ""
    if (format === 'summary') {
      instruction = "Summarize this note and extract 3 key bullet points:\n\n"
    } else if (format === 'flashcards') {
      instruction = "Create 3 study flashcards based on this note. Format as Q: [Question] A: [Answer]:\n\n"
    } else if (format === 'quiz') {
      instruction = "Create a short 3-question multiple-choice quiz based on this note:\n\n"
    } else if (format === 'ask') {
      instruction = `Answer the following question or request: "${prompt}" based ONLY on this note:\n\n`
    } else {
      instruction = "Process this note:\n\n"
    }

    const finalPrompt = instruction + content
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const aiText = data.candidates[0].content.parts[0].text

    return new Response(JSON.stringify({ result: aiText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
>>>>>>> b95ce7254a8b813cef834ed02a8364210c343079
})