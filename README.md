# React + Vite

# 🎵 Sonic AI

Sonic AI adalah aplikasi chatbot AI berbasis web yang dibangun menggunakan React + Vite, didukung oleh Google Gemini API. Aplikasi ini mendukung berbagai fitur modern seperti upload file, generate gambar, voice input, dan tampilan multi-bahasa.

---

## ✨ Fitur

- 💬 Chat AI dengan Google Gemini 2.0 Flash
- 🌙 Dark / Light Mode
- 🌐 Multi-bahasa (25+ bahasa)
- 🎤 Voice Input
- 📁 Upload foto & file
- 🖼️ Generate gambar dari prompt (Hugging Face FLUX)
- 📝 Auto-generate judul chat
- 📱 Responsive (Mobile & Desktop)
- 💾 Riwayat chat

---

## 🚀 Cara Menjalankan

### 1. Clone repository
```bash
git clone https://github.com/stairlanggapw/SonicAI-Stefanus.git
cd SonicAI-Stefanus
```

### 2. Install dependencies
```bash
npm install
```

### 3. Buat file `.env`
```env
VITE_GEMINI_KEY=your_gemini_api_key
VITE_HF_KEY=your_huggingface_token
```

### 4. Jalankan development server
```bash
npm run dev
```

### 5. Build untuk production
```bash
npm run build
```

---

## 🔑 API Keys yang Dibutuhkan

| API | Link | Keterangan |
|-----|------|------------|
| Google Gemini | [aistudio.google.com](https://aistudio.google.com) | Untuk chat AI |
| Hugging Face | [huggingface.co](https://huggingface.co) | Untuk generate gambar |

---

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **AI Chat**: Google Gemini 2.0 Flash
- **Image Generation**: Hugging Face FLUX.1-schnell
- **Mobile**: Capacitor (Android APK)

---

## 📱 Build Android APK

```bash
npm run build
npx cap copy android
npx cap open android
```

Lalu di Android Studio: **Build → Generate APKs → Generate APKs**

---

## 👨‍💻 Developer

Dibuat oleh **Stefanus Airlangga Putra Widyantoro**  
Pelajar SMKN 3 Kendal | StefyNetics

---

## 📄 License

MIT License
