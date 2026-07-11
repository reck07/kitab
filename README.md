# Notebook Pro 📝 (Kitab)

A high-performance, mobile-responsive notebook application built with React 19, Vite, and Capacitor. This application features a robust offline-first architecture using SQLite alongside cloud synchronization capabilities.

---

## 🚀 Features

* **Offline First**: Powered by Capacitor SQLite for reliable, fast local storage.
* **Cloud Sync & Auth**: Integrated with Supabase authentication, featuring a dedicated login page and automatic data syncing.
* **Modern Graph & Analytics**: Visualized notes layout with graph zoom/pan features and automated auto-tagging.
* **Productivity Utilities**: Built-in view switcher, "mind refresh" tool, quick app launcher, and Google Drive sync support.
* **Recycle Bin**: Safety first with a soft-delete and restore mechanism for your notes.
* **Rich Text Editing**: Advanced editor toolbar with support for bold, italics, lists, tag management, and real-time character counting.
* **Auto-Save**: Debounced persistence logic to keep your data safe without sacrificing mobile performance.
* **Sleek UI/UX**: Full dark mode support, polished timeline views featuring compact hexagon layouts (36x42), and responsive transitions.
* **Cross-Platform**: Built from the ground up to run seamlessly on Web and Android.
<img width="398" height="556" alt="image" src="https://github.com/user-attachments/assets/15c26ef4-d988-4fe0-a780-2deeb72aee7e" />

---

## 📱 Android APK Download

You can download and install the latest pre-built application directly onto your Android device:

* **Direct Download Link**: [Kitab-update-v1.1-debug.apk](https://github.com/reck07/kitab/blob/main/Kitab-update-v1.1-debug.apk)

> 💡 **Note:** Alternatively, you can find the raw file located directly in the root directory of this repository named `Kitab-update-v1.1-debug.apk`.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite
* **Backend/Auth**: Supabase
* **Native Bridge**: Capacitor
* **Database**: SQLite (via `@capacitor-community/sqlite`)
* **Styling**: CSS3 utilizing CSS Variables for dynamic Theme Support

---

## 📦 Installation & Setup

Follow these steps to set up the project locally for development:

### 1. Clone the Repository
```bash
git clone [https://github.com/reck07/kitab.git](https://github.com/reck07/kitab.git)
cd kitab
