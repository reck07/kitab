# Notebook Pro 📝

A high-performance, mobile-responsive notebook application built with React, Vite, and Capacitor. This application features a robust offline-first architecture using SQLite.

## 🚀 Features

- **Offline First**: Powered by Capacitor SQLite for reliable local storage.
- **Modern UI**: Full dark mode support, mobile-responsive layout, and smooth transitions.
- **Rich Text Editing**: Support for bold, italics, lists, and real-time character counting.
- **Auto-Save**: Debounced persistence logic to keep your data safe without sacrificing performance.
- **Cross-Platform**: Built to run on Web and Android via Capacitor.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Native Bridge**: Capacitor
- **Database**: SQLite (via `@capacitor-community/sqlite`)
- **Styling**: CSS3 with CSS Variables for Theme Support

## 📦 Installation & Setup

1. Clone the repository: `git clone <your-repo-url>`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. (Optional) For Android:
   - `npm run build`
   - `npx cap sync`
   - `npx cap open android`

## 📄 License
MIT