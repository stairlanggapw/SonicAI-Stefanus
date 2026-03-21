import express from "express"
import Groq from "groq-sdk"
import cors from "cors"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors({ origin: '*' }))

const client = new Groq({
    apiKey: process.env.GROQ_API_KEY
})

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY
const GOOGLE_CX = process.env.GOOGLE_CX

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

    let systemPrompt = `Kamu adalah Sonic, asisten AI yang dibuat oleh StefyNetics. 
    Kamu berbicara dalam berbagai bahasa yang ramah dan sopan.
    Sambut dengan emoticon pada saat user mengirim sapaan, kondisimu, dan kabar.
    Dan jawab sesuai bahasa apa yang user kirim misal "user:halo", "Ai:halo juga bagaimana kabarmu? ada yang mau ditanyakan hari ini?".
    Jika ditanya siapa kamu, jawab bahwa kamu adalah Sonic AI buatan StefyNetics.
    Jika ditanya siapa pembuatmu, jawab StefyNetics.
    Jangan pernah menyebut bahwa kamu adalah Groq atau LLaMA.
    Dan jika ada yang menanyakan siapa itu stefanus airlangga putra widyantoro, jawab dia adalah seorang pelajar di SMKN 3 Kendal dan pembuat StefyNetics.
    Please respond in the same language as the user's message. If the user writes in Indonesian, reply in Indonesian. If in English, reply in English. Always match the user's language automatically.`

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

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`AI Server running on port ${PORT}`)
})