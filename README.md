# Zentrio AI — Startup Company Portal

A premium, production-ready corporate portal and portfolio website for **Zentrio AI**, showcasing enterprise-grade software development and machine learning services. Built using a Node.js Express backend and an animated, accessible vanilla HTML/CSS/JS frontend.

---

## 🚀 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or above recommended).

### Installation & Run

1. Open your terminal in the project directory:
   ```bash
   cd "C:\Users\HP\Desktop\startup app"
   ```

2. Install the server dependencies (Express, Mongoose, JWT, bcryptjs, cookie-parser, dotenv):
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

4. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 📂 Project Structure

```text
project/
│── package.json          # Node.js manifest & scripts
│── server.js            # Express API endpoints & file routes
│── users_db.json        # Fallback local file database (auto-generated)
│── .env                 # Port & secret keys settings
│── README.md            # Startup documentation
│
│── index.html           # Landing page with particle background & counters
│── project.html         # 3x3 grids of portfolio cards & details modals
│── solution.html        # Detailed technical blueprints & timelines
│── pricing.html         # Monthly/Annual switcher & pricing tiers
│── contact.html         # Interactive team profiles & inquiries form
│── login.html           # Secure JWT login panel
│── signup.html          # Secure JWT registration panel
│
├── css/
│   ├── global.css       # HSL custom properties, design tokens, resets
│   ├── navbar.css       # Sticky header, scroll class blurs, mobile menu drawer
│   ├── home.css         # Hero layout, canvas overlays, timeline markers
│   ├── project.css      # Portfolio card structures & metrics tables
│   ├── pricing.css      # Price switches, sliding elements, glowing items
│   ├── contact.css      # Profile circles, skill bar metrics, input controls
│   └── animations.css   # Custom CSS transitions & gradient animations
│
└── js/
    ├── app.js           # Theme toggler, auth synchronizations, click ripples
    ├── navbar.js        # Mobile drawer actions & current URL link indicators
    ├── animation.js     # Interactive particle canvas, GSAP sequences
    ├── project.js       # Grid dataset mappings & details modal triggers
    ├── pricing.js       # Price slider math & discount calculations
    └── contact.js       # Team database models, skill fills, form alerts
```

---

## 🛠 Tech Stack Details

### Backend Architecture
- **Node.js & Express**: High-speed routing engine serving static folders and routing JSON APIs.
- **Database Engine (Mongoose / Fallback)**:
  - Connects to local MongoDB automatically if running on port `27017`.
  - **No-Config Fallback**: If MongoDB is missing, the server outputs a warning and launches a local JSON file-based database (`users_db.json`) on the fly, allowing developers to test signups/logins without installing databases.
- **JWT Cookie Sessions**: Secure cookie validation using signed JSON Web Tokens. Logs out safely, clears tokens, and prevents CSRF.

### Frontend Presentation
- **Vanilla CSS3 (HSL Variables)**: Customizable palette mapping featuring deep dark backdrops (`#0A0A0A`) and smooth slate grids.
- **Micro-Animations**: Mouse-tilt translations, button-click ripples, statistics tally counts, and skill fill effects.
- **GSAP & Canvas Particles**: Premium visuals powered by GSAP coordinate shifts, floating shapes, and interactive node nets in canvas.
- **Lenis Smooth Scroll**: Studio Freight smooth momentum scrolling bindings.

---

## ♿ Accessibility & Performance
- **A11y Standards**: Focus outlines, skip-to-content links, form input associations, aria roles, and screen-reader utility classes.
- **SEO Elements**: Page headings, descriptive titles, and performance-optimized scripts.
