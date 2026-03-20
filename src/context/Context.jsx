import { createContext, useState, useRef, useEffect } from "react"
import { translations } from '../components/Translation'

export const Context = createContext()

const ContextProvider = ({ children }) => {
    const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [chatHistory, setChatHistory] = useState([])
    const [activeChatId, setActiveChatId] = useState(null)
    const activeChatIdRef = useRef(null)
    const [language, setLanguage] = useState('en')
    const t = translations[language]
    const [theme, setTheme] = useState('light')
    const [chatTitle, setChatTitle] = useState('')
    const [uploadedFiles, setUploadedFiles] = useState([])
    const conversationHistory = useRef([])

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')      
            document.body.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')   
            document.body.classList.remove('dark')
        }
    }, [theme])

    const renameChat = (id, newTitle) => {
        setChatHistory(prev =>
            prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
        )
        if (id === activeChatId) setChatTitle(newTitle)
    }

    const deleteChat = (id) => {
        setChatHistory(prev => prev.filter(c => c.id !== id))
        if (activeChatId === id) startNewChat()
    }

    const typeText = (fullText, onUpdate) => {
        let i = 0
        const interval = setInterval(() => {
            i++
            onUpdate(fullText.slice(0, i))
            if (i >= fullText.length) clearInterval(interval)
        }, 15)
    }

    const sendMessage = async (userInput) => {
        const text = userInput || input
        if (!text.trim() && uploadedFiles.length === 0) return

        const userMessage = { role: 'user', text }
        setMessages(prev => [...prev, userMessage])
        setUploadedFiles([])
        setInput('')
        setLoading(true)

        conversationHistory.current.push({
            role: 'user',
            parts: [{ text }]
        })

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: conversationHistory.current
                    })
                }
            )

            const data = await response.json()
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'

            conversationHistory.current.push({
                role: 'model',
                parts: [{ text: aiText }]
            })

            setMessages(prev => [...prev, { role: 'ai', text: '' }])
            setLoading(false)

            typeText(aiText, (partial) => {
                setMessages(prev => {
                    const updated = [...prev]
                    updated[updated.length - 1] = { role: 'ai', text: partial }
                    return updated
                })
            })

            const currentId = activeChatIdRef.current
            const allMessages = [...messages, userMessage, { role: 'ai', text: aiText }]

            if (currentId) {
                setChatHistory(prev =>
                    prev.map(c => c.id === currentId ? { ...c, messages: allMessages } : c)
                )
            } else {
                const newId = Date.now()
                activeChatIdRef.current = newId
                setActiveChatId(newId)
                setChatHistory(prev => [...prev, {
                    id: newId,
                    title: text.slice(0, 30),
                    messages: allMessages
                }])
            }

        } catch (err) {
            console.error('API error:', err)
            setLoading(false)
            setMessages(prev => [...prev, { role: 'ai', text: 'Error: gagal mendapatkan respons.' }])
        }
    }

    const startNewChat = () => {
        setMessages([])
        setInput("")
        setActiveChatId(null)
        activeChatIdRef.current = null
        setChatTitle('')
        conversationHistory.current = []
        setUploadedFiles([])
    }

    const loadChat = (chat) => {
        setMessages(chat.messages)
        setActiveChatId(chat.id)
        activeChatIdRef.current = chat.id
        conversationHistory.current = chat.messages.map(m => ({
            role: m.role === 'ai' ? 'model' : 'user',
            parts: [{ text: m.text }]
        }))
    }

    const contextValue = {
        input, 
        setInput,
        loading,
        messages,
        chatHistory,
        activeChatId,
        language,
        t,
        startNewChat,
        loadChat,
        sendMessage,
        setLanguage,
        theme, 
        setTheme,
        renameChat,   
        deleteChat,
        chatTitle,
        setChatTitle,
        uploadedFiles,
        setUploadedFiles
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider