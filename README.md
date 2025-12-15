# Glucose Control PWA 🩸

A private, offline-first Progressive Web App (PWA) designed to help you track and manage your blood sugar levels with ease. Built with **React**, **TypeScript**, and **Vite**, featuring a beautiful glassmorphism UI.

## ✨ Features

- **Easy Logging**: Quickly log glucose levels with context (Fasting, Pre-meal, Post-meal, etc.).
- **Photo Tracking**: Attach meal photos to your logs to correlate food with spikes.
- **Visual Trends**: View interactive graphs (Today, 7 Days, 30 Days, 6 Months) with min/max/avg stats.
- **History Management**: Browse past records, **edit** entries, or delete mistakes.
- **Customizable**:
  - **Units**: Toggle between `mg/dL` and `mmol/L` (auto-converts existing data).
  - **Language**: Full support for English and Chinese (中文).
  - **Personalize**: Set your name for a friendly greeting.
- **Privacy Focused**: **100% Offline**. All data is stored locally on your device using IndexedDB. No servers, no tracking.
- **PWA Ready**: Install on your iPhone (Add to Home Screen) for a native app-like experience.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS (Mobile-first, Glassmorphism, Dark mode optimization)
- **State/Storage**: React Hooks + [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization**: [i18next](https://www.i18next.com/)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/MattZhu/blood-sugar-control.git
   cd blood-sugar-control
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📱 Deployment (iPhone PWA)

To run this on your iPhone as an app:

1. **Build the project**
   ```bash
   npm run build
   ```
   This creates a `dist` folder.

2. **Host the `dist` folder**
   - You can use services like [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or generic static hosting.
   - Or run a local server (e.g., `python3 -m http.server 8000`) and access it via your computer's local IP address.

3. **Install on iPhone**
   - Open the hosted URL in **Safari**.
   - Tap the **Share** button (box with arrow).
   - Scroll down and tap **"Add to Home Screen"**.

For detailed deployment instructions, see [DEPLOY.md](./DEPLOY.md).

## 📄 License

MIT
