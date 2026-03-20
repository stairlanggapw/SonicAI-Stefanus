import express from "express"
import Groq from "groq-sdk"
import cors from "cors"
import axios from "axios"

const app = express()
app.use(express.json())
app.use(cors())

app.post("/chat", async (req, res) => {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system",  
        content: `Kamu adalah Sonic, asisten AI yang dibuat oleh StefyNetics. 
        Kamu berbicara dalam berbagai bahasa yang ramah dan sopan.
        Sambut dengan emoticon pada saat user mengirim sapaan, kondisimu, dan kabar.
        Dan jawab sesuai bahasa apa yang user kirim misal "user:halo", "Ai:halo juga bagaimana kabarmu? ada yang mau ditanyakan hari ini?.Dan jawab sesuai bahasa yang users gunakan.
        Jika ditanya siapa kamu, jawab bahwa kamu adalah Sonic AI buatan StefyNetics.
        Jika ditanya siapa pembuatmu, jawab StefyNetics.
        Jangan pernah menyebut bahwa kamu adalah Groq atau LLaMA.
        Dan jika ada yang menanyakan siapa itu stefanus airlangga putra widyantoro seorang pelajar di smkn 3 kendal jawab saja dia pembuat stefyNetics.
        Dan jawab pesan users menggunakan bahasa atau language yang digunakan oleh users jadi jika user mengirim pesan menggunakan bahasa inggris pakai bahasa inggris dan seterusnya.
        Jika users mulai bertanya jawab pertanyaan users tanpa emoticon.
        Please respond in the same language as the user's message.
        hello itu bahasa inggris bukan bahasa inddonesia jadi jawab bahasa inggris.`
      },
      { role: "user", content: req.body.message }
    ]
  });

  res.json({
    reply: response.choices[0].message.content
  });
});

const client = new Groq({
    apiKey: "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"
})

const GOOGLE_API_KEY = "AIzaSyBn42okDQzZbtPtrlwZU0DWICOdAXU5E5A"
const GOOGLE_CX = "2162dde63d7fb4b2d"

const searchGoogle = async (query) => {
    const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
        params: {
            key: GOOGLE_API_KEY,
            cx: GOOGLE_CX,
            q: query,
            num: 5
        }
    })
    return res.data.items?.map(item => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
    })) || []
}

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message

    const needsSearch = userMessage.match(
        /hari ini|terbaru|sekarang|berita|harga|cuaca|siapa|kapan|berapa|cari|search|google/i
    )

    let systemPrompt = `Kamu adalah Sonic, asisten AI buatan StefyNetics. 
    Jawab dalam bahasa Indonesia yang ramah.
    Jangan menyebut bahwa kamu Groq atau LLaMA.`

    if (needsSearch) {
        const results = await searchGoogle(userMessage)
        const context = results.map(r => 
            `Judul: ${r.title}\nRingkasan: ${r.snippet}\nLink: ${r.link}`
        ).join("\n\n")

        systemPrompt += `\n\nBerikut hasil pencarian Google yang relevan:\n${context}
        \nGunakan informasi ini untuk menjawab, dan sertakan sumber linknya.`
    }

    const response = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
        ]
    })

    res.json({
        reply: response.choices[0].message.content
    })
})

app.listen(3000, () => {
    console.log("AI Server running on port 3000")
})