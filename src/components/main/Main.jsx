import React, { useContext, useState, useRef, useEffect } from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import ReactMarkdown from 'react-markdown'
import { useNavigate } from 'react-router-dom'

const Main = () => {
    const { input, setInput, loading, messages, sendMessage, t, language, setLanguage, theme, setTheme, chatTitle, setChatTitle, startNewChat, loadChat, chatHistory, activeChatId } = useContext(Context)
    const navigate = useNavigate()
    const [likedMessages, setLikedMessages] = useState({})
    const [copiedMessages, setCopiedMessages] = useState({})
    const [showLangPicker, setShowLangPicker] = useState(false)
    const [langSearch, setLangSearch] = useState('')
    const [showSettings, setShowSettings] = useState(false)
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const settingsRef = useRef(null)
    const [showPlusMenu, setShowPlusMenu] = useState(false)
    const plusMenuRef = useRef(null)
    const isUserScrolling = useRef(false)
    const textareaRef = useRef(null)
    const wrapperRef = useRef(null)
    const folderInputRef = useRef(null)
    const fileInputRef = useRef(null)
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [generatedImage, setGeneratedImage] = useState(null)
    const HF_KEY = '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'  

    const handleCreateImage = async () => {
        if (!input.trim()) return
        setShowPlusMenu(false)
        setLoading(true)
        
        try {
            const response = await fetch(
                'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${HF_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: input })
                }
            )
            
            const blob = await response.blob()
            const imageUrl = URL.createObjectURL(blob)

            setMessages(prev => [...prev, 
                { role: 'user', text: `Generate image: ${input}` },
                { role: 'ai', text: `![generated](${imageUrl})` }
            ])
            setInput('')
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        files.forEach(file => {
            const reader = new FileReader()
            reader.onload = (ev) => {
                const base64 = ev.target.result.split(',')[1]
                setUploadedFiles(prev => [...prev, {
                    name: file.name,
                    type: file.type,
                    base64,
                    preview: file.type.startsWith('image/') ? ev.target.result : null
                }])
            }
            reader.readAsDataURL(file)
        })
        setShowPlusMenu(false)
    }

    const handleFolderUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return
        
        const folderName = files[0].webkitRelativePath.split('/')[0]
        
        const fileContents = await Promise.all(
            files.map(file => new Promise((resolve) => {
                const reader = new FileReader()
                
                if (file.type.startsWith('image/')) {
                    resolve({ name: file.webkitRelativePath, content: '[Image file]', type: 'image' })
                    return
                }
                
                reader.onload = (e) => resolve({ 
                    name: file.webkitRelativePath, 
                    content: e.target.result,
                    type: 'text'
                })
                reader.onerror = () => resolve({ 
                    name: file.webkitRelativePath, 
                    content: '[Cannot read file]',
                    type: 'error'
                })
                reader.readAsText(file)
            }))
        )
        
        const summary = `[Folder: ${folderName}]\n` + 
            fileContents.map(f => `📄 ${f.name}:\n${f.content}`).join('\n\n---\n\n')
        
        setInput(prev => prev + summary)
    }

    useEffect(() => {
    if (wrapperRef.current) {
        wrapperRef.current.scrollTop = wrapperRef.current.scrollHeight
    }
    }, [input])

    const handleVoice = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Browser kamu tidak mendukung voice input.')
            return
        }
        const recognition = new SpeechRecognition()
        recognition.lang = language === 'id' ? 'id-ID' 
            : language === 'ja' ? 'ja-JP'
            : language === 'ar' ? 'ar-SA'
            : language === 'zh' ? 'zh-CN'
            : language === 'ko' ? 'ko-KR'
            : language === 'fr' ? 'fr-FR'
            : language === 'de' ? 'de-DE'
            : language === 'es' ? 'es-ES'
            : 'en-US'
        recognition.continuous = false
        recognition.interimResults = false
        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setInput(transcript)
            setTimeout(() => sendMessage(transcript), 100)
        }
        recognition.start()
    }

    const generateTitle = async (userMessage) => {
        try {
            const res = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 20,
                    messages: [{ role: "user", content: `Create a short title max 5 words for this conversation: "${userMessage}". Only write the title, no quotes.` }]
                })
            })
            const data = await res.json()
            const title = data.content?.[0]?.text || userMessage.slice(0, 30)
            setChatTitle(title)
        } catch {
            setChatTitle(userMessage.slice(0, 30))
        }
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
                setShowPlusMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const lastMsg = messages[messages.length - 1]
        if (lastMsg?.role === 'ai' && lastMsg?.text && messages.length >= 2 && !chatTitle) {
            const userMsg = messages[messages.length - 2]?.text || ''
            generateTitle(userMsg)
        }
    }, [messages])

    useEffect(() => {
        if (messages.length === 0) setChatTitle('')
    }, [messages])

    const handleLike = (index) => {
        setLikedMessages(prev => ({ ...prev, [index]: prev[index] === 'like' ? null : 'like' }))
    }

    const handleDislike = (index) => {
        setLikedMessages(prev => ({ ...prev, [index]: prev[index] === 'dislike' ? null : 'dislike' }))
    }

    const handleCopy = (index, text) => {
        navigator.clipboard.writeText(text)
        setCopiedMessages(prev => ({ ...prev, [index]: true }))
        setTimeout(() => setCopiedMessages(prev => ({ ...prev, [index]: false })), 2000)
    }

    return (
        <div className='main'>
            <div className='nav flex items-center justify-between px-4 py-2 relative'>
                <div className="flex items-center gap-3">

                    <button className="md:hidden" onClick={() => setShowMobileSidebar(true)}>
                        <img  
                            src={assets.sidebar_icon}
                            alt=''
                            className={` ${theme === 'dark' ? 'invert' : ''}`}>
                        </img>
                    </button>
                    <p>Sonic</p>
                </div>

                <p className={`hidden md:block absolute left-1/2 -translate-x-1/2 text-sm font-medium truncate max-w-xs transition-opacity duration-500 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${chatTitle ? 'opacity-100' : 'opacity-0'}`}>
                    {chatTitle}
                </p>

                <div className="flex items-center gap-3">
                    <div className='relative' ref={settingsRef}>
                        <div className='relative group flex flex-col items-center cursor-pointer' onClick={() => setShowSettings(prev => !prev)}>
                            <img src={assets.setting_icon} alt="" className={`w-7 h-7 object-contain ${theme === 'dark' ? 'invert' : ''}`}/>
                            {!showSettings && (
                                <div className="settings-popup absolute top-10 opacity-0 group-hover:opacity-100 transition duration-200 bg-gray-200 text-sm px-3 py-1 rounded-xl shadow whitespace-nowrap">
                                    {t.settings}
                                </div>
                            )}
                        </div>

                        {showSettings && (
                            <div className={`absolute top-10 right-0 rounded-2xl shadow-xl border p-3 w-56 z-50 flex flex-col gap-2 ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3a3a3a]' : 'bg-white border-gray-100'}`}>
                                <div className={`flex gap-1 rounded-xl p-1 justify-around ${theme === 'dark' ? 'bg-[#3a3a3a]' : 'bg-gray-100'}`}>
                                    <button onClick={() => setTheme('light')} className={`p-2 rounded-lg text-sm transition ${theme === 'light' ? 'bg-white shadow' : 'hover:bg-[#484848]'}`}>
                                        <img src={assets.sun_icon} alt="" className={`h-5 w-5 ${theme === 'dark' ? 'invert' : ''}`} />
                                    </button>
                                    <button onClick={() => setTheme('dark')} className={`p-2 rounded-lg text-sm transition ${theme === 'dark' ? 'bg-[#484848] shadow' : 'hover:bg-gray-200'}`}>
                                        <img src={assets.moon_icon} alt="" className={`h-5 w-5 ${theme === 'dark' ? 'invert' : ''}`} />
                                    </button>
                                </div>
                                <hr className={theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-100'} />
                                <button onClick={() => setShowLangPicker(true)} className={`text-sm text-left px-2 py-1.5 rounded-lg transition flex items-center justify-between ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}>
                                    <span>{t.language}</span>
                                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>›</span>
                                </button>
                            </div>
                        )}

                        {showLangPicker && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={() => setShowLangPicker(false)}>
                                <div className={`rounded-2xl shadow-2xl w-80 max-h-96 flex flex-col overflow-hidden ${theme === 'dark' ? 'bg-[#2f2f2f]' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
                                    <div className={`flex items-center gap-2 px-4 py-3 border-b ${theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-100'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>
                                            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                                        </svg>
                                        <input type="text" placeholder={t.placeholder} value={langSearch} onChange={e => setLangSearch(e.target.value)} className={`flex-1 text-sm outline-none bg-transparent ${theme === 'dark' ? 'text-gray-300 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'}`} autoFocus />
                                    </div>
                                    <div className="overflow-y-auto">
                                        {[
                                            { code: 'ar', native: 'العربية', name: 'Arabic' },
                                            { code: 'bn', native: 'বাংলা', name: 'Bengali' },
                                            { code: 'cs', native: 'Čeština', name: 'Czech' },
                                            { code: 'de', native: 'Deutsch', name: 'German' },
                                            { code: 'en', native: 'English', name: 'English' },
                                            { code: 'es', native: 'Español', name: 'Spanish' },
                                            { code: 'fa', native: 'فارسی', name: 'Persian' },
                                            { code: 'fil', native: 'Filipino', name: 'Filipino' },
                                            { code: 'fr', native: 'Français', name: 'French' },
                                            { code: 'hi', native: 'हिन्दी', name: 'Hindi' },
                                            { code: 'id', native: 'Indonesia', name: 'Indonesian' },
                                            { code: 'it', native: 'Italiano', name: 'Italian' },
                                            { code: 'ja', native: '日本語', name: 'Japanese' },
                                            { code: 'ko', native: '한국어', name: 'Korean' },
                                            { code: 'ms', native: 'Melayu', name: 'Malay' },
                                            { code: 'nl', native: 'Nederlands', name: 'Dutch' },
                                            { code: 'pl', native: 'Polski', name: 'Polish' },
                                            { code: 'pt', native: 'Português', name: 'Portuguese' },
                                            { code: 'ru', native: 'Русский', name: 'Russian' },
                                            { code: 'sv', native: 'Svenska', name: 'Swedish' },
                                            { code: 'th', native: 'ภาษาไทย', name: 'Thai' },
                                            { code: 'tr', native: 'Türkçe', name: 'Turkish' },
                                            { code: 'uk', native: 'Українська', name: 'Ukrainian' },
                                            { code: 'vi', native: 'Tiếng Việt', name: 'Vietnamese' },
                                            { code: 'zh', native: '中文', name: 'Chinese' },
                                        ].filter(lang =>
                                            lang.native.toLowerCase().includes(langSearch.toLowerCase()) ||
                                            lang.name.toLowerCase().includes(langSearch.toLowerCase())
                                        ).map(lang => (
                                            <button key={lang.code} onClick={() => { setLanguage(lang.code); setShowLangPicker(false); setShowSettings(false); setLangSearch('') }} className={`w-full flex items-center justify-between px-4 py-3 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a]' : 'hover:bg-gray-50'}`}>
                                                <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}>{lang.native}</span>
                                                <div className="flex items-center gap-3">
                                                    {language === lang.code && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                    )}
                                                    <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}>{lang.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <img src={assets.user_icon} alt="" className='rounded-full cursor-pointer'/>
                </div>
            </div>

            <div className="main-container">
                {messages.length === 0 ? (
                    <>
                        <div className="greet">
                            <p><span>{t.greeting}</span></p>
                            <p>{t.subGreeting}</p>
                        </div>
                        <div className="cards">
                            <div className="card" onClick={() => sendMessage(t.card1)}>
                                <p>{t.card1}</p>
                                <img src={assets.compass_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                            </div>
                            <div className="card" onClick={() => sendMessage(t.card2)}>
                                <p>{t.card2}</p>
                                <img src={assets.bulb_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                            </div>
                            <div className="card" onClick={() => sendMessage(t.card3)}>
                                <p>{t.card3}</p>
                                <img src={assets.message_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                            </div>
                            <div className="card" onClick={() => sendMessage(t.card4)}>
                                <p>{t.card4}</p>
                                <img src={assets.code_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="result">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message ${msg.role}`}>
                                    {msg.role === "ai" ? (
                                        <div className="ai-avatar">
                                            <div className="ball-bounce"><span></span></div>
                                        </div>
                                    ) : null}
                                    {msg.role === "ai" ? (
                                        <div className="message-content">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            <div className="message-actions">
                                                <span className={`action-btn ${likedMessages[index] === 'like' ? 'active' : ''} ${theme === 'dark' ? 'invert' : ''}`} onClick={() => handleLike(index)} title="Like">
                                                    {likedMessages[index] === 'like' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                                                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
                                                            <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                                                        </svg>
                                                    )}
                                                </span>
                                                <span className={`action-btn ${likedMessages[index] === 'dislike' ? 'active' : ''} ${theme === 'dark' ? 'invert' : ''}`} onClick={() => handleDislike(index)} title="Dislike">
                                                    {likedMessages[index] === 'dislike' ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                                                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/>
                                                            <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
                                                        </svg>
                                                    )}
                                                </span>
                                                {copiedMessages[index] ? (
                                                    <svg className="check-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <img src={assets.copy_icon} alt="copy" title="Copy" onClick={() => handleCopy(index, msg.text)} className={`${theme === 'dark' ? 'invert' : ''}`}/>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <p>{msg.text}</p>
                                    )}
                                </div>
                            ))}
                            {loading && (
                                <div className="message ai">
                                    <div className="ai-avatar">
                                        <div className="ball-bounce"><span></span></div>
                                    </div>
                                    <div className="typing-loader">
                                        <div className="typing-line"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
                <div className="main-bottom">
                    {showPlusMenu && (
                        <div ref={plusMenuRef} className={`absolute bottom-25 left-6 rounded-2xl shadow-xl border w-52 py-2 z-50 ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3a3a3a]' : 'bg-white border-gray-200'}`}>
                            <button 
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                                onClick={() => fileInputRef.current.click()}
                                >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                </svg>
                                Add photos & files
                            </button>
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                multiple
                                style={{ display: 'none' }} 
                                onChange={handleFileUpload} 
                            />
                            <button 
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}
                                onClick={handleCreateImage}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                Create image
                            </button>
                            <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                                Deep research
                            </button>
                            <hr className={`my-1 ${theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-100'}`} />
                            <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-200' : 'hover:bg-gray-50 text-gray-700'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                                More
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>
                    )}

                    {uploadedFiles.length > 0 && (
                        <div className="uploaded-files-preview">
                            {uploadedFiles.map((f, i) => (
                                <div key={i} className="file-chip">
                                    {f.preview 
                                        ? <img src={f.preview} alt={f.name} className="file-thumb" />
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    }
                                    <span>{f.name}</span>
                                    <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="search-box">
                        <div className="group relative flex items-center">
                            <img
                                src={assets.Plus_icon}
                                alt=""
                                className={`cursor-pointer ${theme === 'dark' ? 'invert' : ''}`}
                                onClick={() => setShowPlusMenu(prev => !prev)}
                            />
                            {!showPlusMenu && (
                                <div className="absolute bottom-8 left-0 opacity-0 group-hover:opacity-100 transition duration-200 whitespace-nowrap pointer-events-none">
                                    <div className={`px-2 py-1 rounded-lg text-xs ${theme === 'dark' ? 'bg-[#3a3a3a] text-gray-200' : 'bg-gray-800 text-white'}`}>
                                        Add files and more
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className={`textarea-wrapper ${theme === 'dark' ? 'invert' : ''}`} ref={wrapperRef}>
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                placeholder={t.placeholder}
                                value={input}
                                onChange={(e) => {
                                setInput(e.target.value)
                                e.target.style.height = 'auto'
                                e.target.style.height = e.target.scrollHeight + 'px'
                                }}
                                onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    sendMessage()
                                    if (textareaRef.current) {
                                    textareaRef.current.style.height = 'auto'
                                    }
                                }
                                }}
                                style={{ resize: 'none', overflow: 'hidden' }}
                            />
                        </div>                       
                        <div>
                            <img src={assets.mic_icon} alt="" onClick={handleVoice} style={{ cursor: 'pointer' }} className={`${theme === 'dark' ? 'invert' : ''} ${isListening ? 'opacity-50 animate-pulse' : ''} transition-all`}/>
                            <img src={assets.send_icon} alt="" onClick={() => sendMessage()} style={{ cursor: 'pointer' }} className={`${theme === 'dark' ? 'invert' : ''}`}/>
                        </div>
                    </div>
                    <p className='bottom-info'>{t.bottomInfo}</p>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileSidebar(false)} />
                    <div className={`absolute left-0 top-0 h-full w-64 shadow-xl flex flex-col justify-between p-5 ${theme === 'dark' ? 'bg-[#171717]' : 'bg-[#f0f4f9]'}`}>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <img src={assets.icons_icon} alt="" className='h-8 w-8 cursor-pointer' onClick={() => { startNewChat(); setShowMobileSidebar(false) }}/>
                                <button onClick={() => setShowMobileSidebar(false)}>
                                    <img src={assets.sidebar_icon} alt="" className={`h-6 w-6 ${theme === 'dark' ? 'invert' : ''}`}/>
                                </button>
                            </div>
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer ${theme === 'dark' ? 'bg-[#2f2f2f] text-gray-200' : 'bg-[#e2e8f0] text-gray-700'}`} onClick={() => { startNewChat(); setShowMobileSidebar(false) }}>
                                <img src={assets.plus_icon} alt="" className={`w-4 h-4 ${theme === 'dark' ? 'invert' : ''}`}/>
                                <p className="text-sm">{t.newChat}</p>
                            </div>
                            <p className={`text-xs font-medium px-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{t.yourChats}</p>
                            <div className="flex flex-col gap-1 overflow-y-auto max-h-96">
                                {chatHistory.map(chat => (
                                    <div key={chat.id} onClick={() => { loadChat(chat); setShowMobileSidebar(false) }}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${
                                            activeChatId === chat.id
                                                ? theme === 'dark' ? 'bg-[#2f2f2f] text-gray-200' : 'bg-[#d0e2ff] text-gray-800'
                                                : theme === 'dark' ? 'hover:bg-[#2f2f2f] text-gray-300' : 'hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        
                                        <span className="truncate">{chat.title}...</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${theme === 'dark' ? 'hover:bg-[#2f2f2f] text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`} onClick={() => { navigate('/report'); setShowMobileSidebar(false) }}>
                                <img src={assets.question_icon} alt="" className={`w-5 h-5 ${theme === 'dark' ? 'invert' : ''}`}/>
                                <p>{t.helpReport}</p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm ${theme === 'dark' ? 'hover:bg-[#2f2f2f] text-gray-300' : 'hover:bg-gray-200 text-gray-700'}`}>
                                <img src={assets.history_icon} alt="" className={`w-5 h-5 ${theme === 'dark' ? 'invert' : ''}`}/>
                                <p>{t.activity}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Main