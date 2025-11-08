# 📱 SEP490-PMS-APP

A modern **React Native** mobile application built with **Expo**, **TypeScript**, and a clean architecture for scalable development. Designed for performance, maintainability, and team collaboration.

---

## 🚀 Features

- ⚡ Built with [Expo](https://expo.dev/)
- 💙 TypeScript support
- 📦 Scalable folder structure
- 📡 Axios for API handling
- 📊 Redux Toolkit for state management
- 🌐 React Navigation
- 🔧 Utility-based architecture (hooks, services, utils, constants)
- 🎨 Centralized theming & route configs

---

## 🛠️ Setup & Run

### 1. 📥 Clone project

```bash
git clone https://github.com/your-username/SEP490-PMS-APP.git
cd SEP490-PMS-APP
```

### 2. 📦 Install dependencies

<pre class="overflow-visible!" data-start="902" data-end="925"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm install</span></span></code></div></div></pre>

### 3. ▶️ Start development server

<pre class="overflow-visible!" data-start="1000" data-end="1026"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npx expo start
</span></span></code></div></div></pre>

- 📱 **Use Expo Go** to scan QR code running on your phone
- 💻 Or run the simulation:

  - Android emulator: `npm run android`
  - iOS simulator (Mac): `npm run ios`
  - Web preview: `npm run web`


  ## 📁 Project Structure

  [](https://github.com/PhamKien2803/SEP490-pms-app#-project-structure)


  ```shell
  src/
  │
  ├── assets/           # Fonts, images, icons, logos, etc.
  ├── components/       # Reusable UI components (Button, Card, etc.)
  ├── constants/        # Colors, spacing, typography, route names, etc.
  ├── hooks/            # Custom React hooks (useAuth, useDebounce, etc.)
  ├── modal/            # App-wide modals & dialogs
  ├── redux/            # Global state (Redux Toolkit slices, store setup)
  ├── routes/           # App navigation (stack/tab navigators)
  ├── screens/          # Main screen pages (Login, Home, Profile, etc.)
  ├── services/         # API calls and service logic (authService, api.ts)
  ├── types/            # Global TypeScript interfaces and enums
  ├── utils/            # Helper functions (formatters, validators, etc.)
  ```
