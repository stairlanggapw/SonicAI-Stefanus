import { createContext, useState, useRef, useEffect } from "react"
import { translations } from '../components/Translation'

export const Context = createContext()

const ContextProvider = ({ children }) => {
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

    const sendMessage = async (customMessage = null) => { 
        const userMessage = customMessage || input 
        if (!userMessage.trim()) return

        let currentId = activeChatIdRef.current
        if (!currentId) {
            currentId = Date.now()
            activeChatIdRef.current = currentId
            setActiveChatId(currentId)
            setChatHistory(prev => [...prev, {
                id: currentId,
                title: userMessage.slice(0, 25),
                messages: []
            }])
        }

        setMessages(prev => [...prev, { role: "user", text: userMessage }])
        setInput("")
        setLoading(true)

        const res = await fetch("http://localhost:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: userMessage,
                language: language 
            })
        })
        const data = await res.json()
        setLoading(false)

        setMessages(prev => [...prev, { role: "ai", text: "" }])

        typeText(data.reply, (partial) => {
            setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "ai", text: partial }
                if (partial === data.reply) {
                    setChatHistory(prevHistory =>
                        prevHistory.map(c =>
                            c.id === activeChatIdRef.current
                                ? { ...c, messages: updated }
                                : c
                        )
                    )
                }
                return updated
            })
        })
    }

    const startNewChat = () => {
        setMessages([])
        setInput("")
        setActiveChatId(null)
        activeChatIdRef.current = null
        setChatTitle('')
    }

    const loadChat = (chat) => {
        setMessages(chat.messages)
        setActiveChatId(chat.id)
        activeChatIdRef.current = chat.id
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
        setChatTitle
    }

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    )
}

export default ContextProvider