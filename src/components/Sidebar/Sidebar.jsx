import React, { useContext, useState, useEffect, useRef } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import { useNavigate } from 'react-router-dom'

const Sidebar = () => {
    const navigate = useNavigate()
    const [extended, setExtended] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)
    const [renaming, setRenaming] = useState(null)
    const [renameValue, setRenameValue] = useState('')
    const menuRef = useRef(null)

    const { chatHistory, startNewChat, loadChat, activeChatId, t, theme, renameChat, deleteChat } = useContext(Context)

    // Tutup menu saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setActiveMenu(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleRenameSubmit = (id) => {
        if (renameValue.trim()) renameChat(id, renameValue.trim())
        setRenaming(null)
        setRenameValue('')
    }

    return (
        <div className={`sidebar ${extended ? 'extended' : ''}`}>
            <div className="top">
                {extended ? (
                    <div className="flex items-center justify-between w-full">
                        <img 
                            src={assets.icons_icon} 
                            alt="" 
                            className='icon h-8 w-8 -ml-2 outline outline-2 outline-transparent hover:outline-gray-400 hover:bg-gray-400 rounded-xl transition-all cursor-pointer'
                            onClick={startNewChat}
                        />
                        <img
                            src={assets.sidebar_icon}
                            alt=""
                            className={`menu cursor-pointer h-6 w-6 ${theme === 'dark' ? 'invert' : ''}`}
                            onClick={() => setExtended(prev => !prev)}
                        />
                    </div>
                ) : (
                    <div
                        className="menu-btn -ml-2"
                        onClick={() => setExtended(prev => !prev)}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                    >
                        {hovered ? (
                            <img src={assets.sidebar_icon} alt="" className={`menu h-7 w-7 ${theme === 'dark' ? 'invert' : ''}`} />                            
                        ) : (
                            <img src={assets.icons_icon} alt="" className='icon h-8 w-8' />
                        )}
                    </div>
                )}

                <div className="new-chat" onClick={startNewChat}>
                    <img src={assets.plus_icon} alt="" />
                    {extended && <p>{t.newChat}</p>}
                </div>

                {extended && (
                    <div className="recent">
                        <p className="recent-title">{t.yourChats}</p>
                        {chatHistory.map(chat => (
                            <div
                                key={chat.id}
                                className={`recent-entry group ${activeChatId === chat.id ? 'active-chat' : ''}`}
                                onClick={() => loadChat(chat)}
                            >
                                {renaming === chat.id ? (
                                    <input
                                        autoFocus
                                        value={renameValue}
                                        onChange={e => setRenameValue(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleRenameSubmit(chat.id)
                                            if (e.key === 'Escape') { setRenaming(null); setRenameValue('') }
                                        }}
                                        onBlur={() => handleRenameSubmit(chat.id)}
                                        onClick={e => e.stopPropagation()}
                                        className={`flex-1 text-sm outline-none rounded px-1 ${theme === 'dark' ? 'bg-[#3a3a3a] text-gray-200' : 'bg-gray-100 text-gray-800'}`}
                                    />
                                ) : (
                                    <p className="flex-1 truncate">{chat.title}...</p>
                                )}

                                {/* Dots button */}
                                <div className="relative" ref={activeMenu === chat.id ? menuRef : null}>
                                    <img
                                        src={assets.dots_icon}
                                        alt=""
                                        className={`w-4 h-4 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity ${theme === 'dark' ? 'invert' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActiveMenu(activeMenu === chat.id ? null : chat.id)
                                        }}
                                    />

                                    {activeMenu === chat.id && (
                                        <div
                                            className={`absolute right-0 top-6 z-50 rounded-xl shadow-lg border w-44 py-1 ${theme === 'dark' ? 'bg-[#2f2f2f] border-[#3a3a3a]' : 'bg-white border-gray-100'}`}
                                            onClick={e => e.stopPropagation()}
                                        >
                                            <button
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                <img src={assets.pin_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                                                <p>Pin Chat</p>
                                            </button>
                                            <button
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                                                onClick={() => {
                                                    setRenaming(chat.id)
                                                    setRenameValue(chat.title)
                                                    setActiveMenu(null)
                                                }}
                                            >
                                                <img src={assets.pencil_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                                                <p>Rename</p>
                                            </button>
                                            <button
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${theme === 'dark' ? 'hover:bg-[#3a3a3a] text-gray-300' : 'hover:bg-gray-50 text-gray-700'}`}
                                                onClick={() => setActiveMenu(null)}
                                            >
                                                <img src={assets.archive_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                                                <p>Archive</p>
                                            </button>
                                            <hr className={`my-2 ${theme === 'dark' ? 'border-[#3a3a3a]' : 'border-gray-100'}`} />
                                            <button
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition text-red-400 ${theme === 'dark' ? 'hover:bg-[#3a3a3a]' : 'hover:bg-red-50'}`}
                                                onClick={() => {
                                                    deleteChat(chat.id)
                                                    setActiveMenu(null)
                                                }}
                                            >
                                                <img src={assets.trash_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                                                <p>Delete</p>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry" onClick={() => navigate('/report')}>
                    <img src={assets.question_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                    {extended && <p>{t.helpReport}</p>}
                </div>
                <div className="bottom-item recent-entry">
                    <img src={assets.history_icon} alt="" className={`${theme === 'dark' ? 'invert' : ''}`}/>
                    {extended && <p>{t.activity}</p>}
                </div>
            </div>
        </div>
    )
}

export default Sidebar