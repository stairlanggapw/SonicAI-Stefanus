import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'

export default function ReportForm() {
    const navigate = useNavigate()
    const { t, theme } = useContext(Context)
    const d = theme === 'dark'
    const [form, setForm] = useState({ name: "", email: "", message: "", category: "Bug" })
    const [sent, setSent] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)

    const handleSubmit = async () => {
        if (!form.name || !form.email || !form.message) return
        const formData = {
            access_key: "07d094ed-b23c-496d-ba79-129057e195c4",
            name: form.name,
            email: form.email,
            message: `Kategori: ${form.category}\n\n${form.message}`,
            subject: `[Sonic AI] Laporan Baru - ${form.category}`
        }
        try {
            const res = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) setSent(true)
            else alert("Failed to send report. Try again!")
        } catch {
            alert("An error occurred. Try again!")
        }
    }

    return (
        <div className={`min-h-screen w-full ${d ? 'bg-[#212121]' : 'bg-gray-50'}`}>

            <div className={`flex items-center justify-between px-8 py-4 border-b shadow-sm ${d ? 'bg-[#2f2f2f] border-[#3a3a3a]' : 'bg-white border-gray-100'}`}>
                <button onClick={() => navigate('/')} className={`flex items-center gap-2 transition text-sm font-medium ${d ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                    {t.back}
                </button>
                <div className="flex items-center gap-2">
                    <img className="w-10 h-10 object-contain" src={assets.icons_icon} alt=''/>
                    <span className={`font-semibold ${d ? 'text-gray-100' : 'text-gray-800'}`}>{t.helpCenter}</span>
                </div>
                <div className="w-20" />
            </div>

            <div className="relative bg-gradient-to-tr from-violet-500 to-pink-500 py-16 px-8 text-center overflow-hidden">
                <div className="absolute w-64 h-64 bg-white/10 rounded-full -top-20 -left-20 animate-blob" />
                <div className="absolute w-64 h-64 bg-white/10 rounded-full -bottom-20 -right-20 animate-blob-delay" />
                <h1 className="text-4xl font-bold text-white relative z-10">{t.howCanWeHelp}</h1>
                <p className="text-violet-100 mt-3 text-sm relative z-10">{t.helpSubtitle}</p>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">

                <div className="w-full lg:w-1/2">
                    <h2 className={`text-xl font-bold ${d ? 'text-gray-100' : 'text-gray-800'}`}>{t.faqTitle}</h2>
                    <p className={`text-sm mt-1 mb-6 ${d ? 'text-gray-400' : 'text-gray-400'}`}>{t.faqSubtitle}</p>
                    <div className="flex flex-col gap-3">
                        {t.faqs.map((faq, i) => (
                            <div key={i} className={`border rounded-xl overflow-hidden ${d ? 'border-[#3a3a3a] bg-[#2f2f2f]' : 'border-gray-200 bg-white'}`}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className={`w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium transition ${d ? 'text-gray-200 hover:bg-[#3a3a3a]' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {faq.q}
                                    <span className={`text-lg ${d ? 'text-gray-400' : 'text-gray-400'}`}>{openFaq === i ? '−' : '+'}</span>
                                </button>
                                {openFaq === i && (
                                    <div className={`px-5 pb-4 text-sm ${d ? 'text-gray-400' : 'text-gray-500'}`}>{faq.a}</div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-full lg:w-1/2">
                    <div className={`border rounded-2xl p-8 shadow-sm ${d ? 'bg-[#2f2f2f] border-[#3a3a3a]' : 'bg-white border-gray-200'}`}>
                        {sent ? (
                            <div className="flex flex-col items-center gap-4 py-16">
                                <span className="text-7xl">✅</span>
                                <p className={`text-xl font-semibold text-center ${d ? 'text-gray-100' : 'text-gray-700'}`}>{t.successTitle}</p>
                                <p className={`text-sm text-center ${d ? 'text-gray-400' : 'text-gray-400'}`}>{t.successSubtitle}</p>
                                <button
                                    onClick={() => { setSent(false); setForm({ name: "", email: "", message: "", category: "Bug" }) }}
                                    className="mt-4 py-3 px-6 rounded-xl bg-violet-600 text-white font-bold hover:scale-[1.01] active:scale-[.98] transition-all"
                                >
                                    {t.submitAgain}
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className={`text-xl font-bold ${d ? 'text-gray-100' : 'text-gray-800'}`}>{t.submitReport}</h2>
                                <p className={`text-sm mt-1 mb-6 ${d ? 'text-gray-400' : 'text-gray-400'}`}>{t.submitSubtitle}</p>
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className={`text-sm font-medium ${d ? 'text-gray-300' : 'text-gray-700'}`}>{t.nameLabel} <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            placeholder={t.namePlaceholder}
                                            value={form.name}
                                            onChange={(e) => setForm({...form, name: e.target.value})}
                                            className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm outline-none transition ${d ? 'bg-[#3a3a3a] border-[#4a4a4a] text-gray-200 placeholder-gray-500 focus:border-violet-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-violet-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${d ? 'text-gray-300' : 'text-gray-700'}`}>{t.emailLabel} <span className="text-red-400">*</span></label>
                                        <input
                                            type="email"
                                            placeholder="example@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({...form, email: e.target.value})}
                                            className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm outline-none transition ${d ? 'bg-[#3a3a3a] border-[#4a4a4a] text-gray-200 placeholder-gray-500 focus:border-violet-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-violet-400'}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${d ? 'text-gray-300' : 'text-gray-700'}`}>{t.categoryLabel}</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {t.categories.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    onClick={() => setForm({...form, category: cat.value})}
                                                    className={`px-4 py-2 rounded-full text-sm border transition ${
                                                        form.category === cat.value
                                                            ? 'bg-violet-600 text-white border-violet-600'
                                                            : d
                                                                ? 'bg-[#3a3a3a] text-gray-300 border-[#4a4a4a] hover:border-violet-400'
                                                                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-400'
                                                    }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`text-sm font-medium ${d ? 'text-gray-300' : 'text-gray-700'}`}>{t.messageLabel} <span className="text-red-400">*</span></label>
                                        <textarea
                                            placeholder={t.messagePlaceholder}
                                            rows={5}
                                            value={form.message}
                                            onChange={(e) => setForm({...form, message: e.target.value})}
                                            className={`w-full border rounded-xl px-4 py-3 mt-1 text-sm outline-none transition resize-none ${d ? 'bg-[#3a3a3a] border-[#4a4a4a] text-gray-200 placeholder-gray-500 focus:border-violet-400' : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-violet-400'}`}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        className="w-full py-3 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-xl font-bold text-sm hover:scale-[1.01] active:scale-[.98] transition-all text-white"
                                    >
                                        {t.submitBtn}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={`border-t px-8 py-6 flex justify-between items-center text-sm ${d ? 'border-[#3a3a3a] text-gray-500' : 'border-gray-200 text-gray-400'}`}>
                <p>{t.footerRights}</p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/')} className={`transition ${d ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>{t.homePage}</button>
                    <button className={`transition ${d ? 'hover:text-gray-300' : 'hover:text-gray-600'}`}>{t.contact}</button>
                </div>
            </div>
        </div>
    )
}