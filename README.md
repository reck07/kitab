# Personal Notebook — Smart Notes & Productivity App

A high-performance, responsive, cross-platform personal notebook application built with **React 19, Vite, and Capacitor**. Designed with an offline-first architecture, it enables users to create, organize, and manage notes seamlessly across web and Android devices, with cloud synchronization and secure authentication.

You can directly used the application give the feedback
download link : https://drive.google.com/file/d/1zUiO0eCjC6q8Ab5CVngf1u7sTbMLPD2Q/view?usp=drivesdk

### Key Features

- **Offline-First Architecture:** Supports local note storage using browser `localStorage` and Capacitor SQLite on Android, allowing users to create and edit notes without an internet connection.

- **Cloud Synchronization & Authentication:** Integrates Supabase authentication and cloud-based data synchronization to support secure access and cross-device note management.

- **Interactive Graph Visualization:** Provides a visual representation of notes with zoom and pan controls, making it easier to explore and navigate connected information.

- **Smart Tagging & Organization:** Includes automated tag generation and tag management to improve note categorization and retrieval.

- **Productivity Tools:** Features multiple viewing modes, a Mind Refresh tool, and a quick app launcher for a more efficient and personalized workflow.

- **Google Drive Integration:** Supports Google Drive synchronization capabilities for convenient file management and backup workflows.

- **Recycle Bin & Recovery:** Implements soft deletion, allowing users to restore accidentally deleted notes before permanently removing them.

- **Rich Text Editor:** Offers formatting tools for bold and italic text, lists, tag management, and real-time character counting.

- **Automatic Saving:** Uses debounced persistence to save changes efficiently, reducing unnecessary storage operations while maintaining a smooth editing experience.

- **Modern UI/UX:** Features a clean, mobile-responsive interface with full dark mode support, timeline-based navigation, compact hexagonal layouts (36 × 42), and smooth transitions.

- **Cross-Platform Compatibility:** Built with React and Capacitor to support web browsers and Android devices through a shared application codebase.

### Technology Stack

- **Frontend:** React 19, Vite, JavaScript, CSS
- **Mobile Framework:** Capacitor
- **Local Storage:** Browser localStorage, SQLite on Android
- **Backend & Authentication:** Supabase
- **Cloud Integration:** Supabase synchronization and Google Drive integration
- **Core Capabilities:** Offline note editing, automatic saving, rich text formatting, smart tagging, graph visualization, and note recovery

### Project Goal

To deliver a reliable, fast, and user-friendly personal knowledge management application that combines offline accessibility, cloud synchronization, flexible note organization, and productivity tools in a single cross-platform experience.
<img width="400" height="222" alt="Screenshot 2026-07-11 134059" src="https://github.com/user-attachments/assets/1711d363-4581-4439-b4fc-1035be8c9444" />
<img width="751" height="587" alt="Screenshot 2026-07-11 133914" src="https://github.com/user-attachments/assets/a542b534-3d69-4fbd-9d1a-7b792dc5232a" />
<img width="407" height="859" alt="Screenshot 2026-07-11 134215" src="https://github.com/user-attachments/assets/1c98477b-8644-4523-a58c-397589c29a7b" /><img width="407" height="704" alt="Screenshot 2026-07-11 134116" src="https://github.com/user-attachments/assets/1ef9118e-2dfa-4155-983a-0e96307482e0" />
<img width="394" height="860" alt="Screenshot 2026-07-11 134017" src="https://github.com/user-attachments/assets/d61442e0-48e1-4b26-a55f-c4322c9979f9" />
<img width="397" height="861" alt="Screenshot 2026-07-11 134003" src="https://github.com/user-attachments/assets/3b9d679b-f80c-49fc-b5b7-0220056088a7" />
<img width="406" height="789" alt="Screenshot 2026-07-11 134050" src="https://github.com/user-attachments/assets/26db2c80-ba3a-488c-b267-7aa60d4802c5" />
<img width="400" height="885" alt="Screenshot 2026-07-11 134341" src="https://github.com/user-attachments/assets/26ca6f8c-4d5a-4904-a787-cb083f4e98e1" />
<img width="392" height="767" alt="Screenshot 2026-07-11 134324" src="https://github.com/user-attachments/assets/4ccc3c46-ca6b-4a00-b459-b2ad73bd42c1" />
<img width="396" height="799" alt="Screenshot 2026-07-11 134300" src="https://github.com/user-attachments/assets/b5679198-034b-47d8-b231-c7d6f3917dc4" />
<img width="397" height="652" alt="Screenshot 2026-07-11 134240" src="https://github.com/user-attachments/assets/3e979a32-6462-4b8d-af9b-099a27d74cd4" />
<img width="398" height="556" alt="Screenshot 2026-07-11 134424" src="https://github.com/user-attachments/assets/5b134145-5196-4254-8971-c3b8ff5342e5" />
<img width="396" height="862" alt="Screenshot 2026-07-11 134401" src="https://github.com/user-attachments/assets/76d082a9-57d7-44b9-b8dd-f91570afbda8" />
<img width="177" height="632" alt="Screenshot 2026-07-11 134031" src="https://github.com/user-attachments/assets/1cc327f9-1b43-4f30-bf0a-99d0874713f4" />


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
* **Database**: `localStorage` on web, SQLite (via Capacitor) on Android, with Supabase for cloud sync
* **Styling**: CSS3 utilizing CSS Variables for dynamic Theme Support

---

## 📦 Installation & Setup

Follow these steps to set up the project locally for development:

### 1. Clone the Repository
```bash
git clone https://github.com/reck07/kitab.git
cd kitab
npm install

# Create your local env file, then fill in the values
cp .env.example .env

# Web dev server (http://localhost:5173)
npm run dev

# Build web assets and push them into the Android project
npm run cap:sync

# Debug APK -> android/app/build/outputs/apk/debug/
npm run android:build
```

`.env` needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Without them the app still
runs, but cloud auth/sync is disabled and only local (guest) mode is available.
