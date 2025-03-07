<h1 align="center">
  Apocalypse Simulator (as-react)
</h1>

<p align="center">
  <img src="https://res.cloudinary.com/dcstkilp1/image/upload/v1741287186/as-sprites/ato6kcxq7mvcz3impspr.png" alt="Apocalypse Simulator" width="100" />
</p>

## 📝 Description
**Apocalypse Simulator** is an interactive question-and-action game where your choices affect your stats. Every 10 in-game days, you will face an enemy with movement and combat mechanics.

You can play as a guest with a limitation of 10 in-game days, or log in with Google to unlock the full game and manage up to 8 characters.

## 🚀 Live Demo
🔗 [Play Now](https://as.gorocode.dev/)

### 🚨 Backend Information (Render Deployment)
The backend of this project is deployed on **Render** and may enter **sleep mode** after a period of inactivity. The first request after the backend is in sleep mode may take a few moments to start up.

#### Please be patient while it initializes.

## 📦 Related Repositories
- 🔗 **Frontend:** [as-react](https://github.com/gorocode/as-react)
- 🔗 **Backend:** [as-spring-boot](https://github.com/gorocode/as-spring-boot)

## 🛠️ Technologies Used
- **Frontend:** React (Vite), TailwindCSS, Zustand, React Router
- **Authentication:** Google OAuth
- **Image Storage:** Cloudinary
- **Backend:** Spring Boot (Requires `BASE_URL` configuration to function correctly)

## 📂 Installation and Setup

### 🔧 Prerequisites
- Node.js (>=16)
- npm or yarn

### 📥 Installation
```bash
# Clone the repository
git clone https://github.com/gorocode/as-react.git
cd as-react

# Install dependencies
npm install
```

### ⚙️ Configuration
In the root of the project, create a `.env` file and add the following environment variables:
```env
VITE_BASE_URL=<BACKEND_URL>
VITE_CLOUDINARY_NAME=<YOUR_CLOUDINARY_NAME>
VITE_CLOUDINARY_PRESENT=<YOUR_CLOUDINARY_PRESENT>
```

### ▶️ Running the Project
```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview the build
npm run preview
```

## 🎮 Game Mechanics
- **Question Mode:** Choose between two options that modify your stats.
- **Combat Mode:** 
  - An enemy appears every 10 days.
  - Move with `A` (left), `D` (right), and `W` (jump).
  - On touch devices, tap the character to jump.
  - Shoot projectiles at the enemy and avoid its attacks.
  - Drag the enemy into the game area for your projectiles to hit.

## 👥 User Management
- Play as a guest (limited to 10 in-game days).
- Log in with Google to:
  - Access the full game.
  - Create and manage up to 8 characters.
  - Save and continue your game.
  - Change your profile picture (uploaded to Cloudinary).

## 🤝 Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a branch for your feature (`git checkout -b feature-new`).
3. Commit your changes (`git commit -m "Add new feature"`).
4. Push your changes (`git push origin feature-new`).
5. Open a Pull Request.

## 📝 License
This project is licensed under the **MIT** License. See the `LICENSE` file for more details.