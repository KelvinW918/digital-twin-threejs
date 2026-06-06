# 🏭 Digital Twin · Warehouse Inventory 3D

<div align="center">

![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)
![Status](https://img.shields.io/badge/Status-Live-00ff88?style=for-the-badge)

**Interactive 3D Warehouse Digital Twin**  
*Real-time inventory simulation · Color-coded stock levels · Click interactions*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Vercel-000000?style=for-the-badge)](https://digital-twin-threejs-kaw.vercel.app)

</div>

---

## 🎯 What is this?

A **Digital Twin** of a warehouse inventory system that visualizes stock levels in 3D space. Built with Three.js, this demo shows how IoT data can be represented in real-time.

**Why a Digital Twin matters:**
- 📦 Visualize thousands of products at a glance
- 🔴 Instantly identify low-stock zones (red products)
- 🟡 Monitor medium-stock areas needing attention
- 🟢 Track healthy inventory levels

---

## 🎮 Live Demo

👉 **Try it now:** [digital-twin-threejs.vercel.app](https://digital-twin-threejs.vercel.app)

| Action | Result |
|--------|--------|
| 🖱️ **Left click + drag** | Rotate camera around warehouse |
| 📜 **Scroll** | Zoom in/out |
| 🖱️ **Right click + drag** | Pan across the scene |
| 🔴 **Click on any product** | View stock percentage and ID |

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Three.js** | 3D rendering engine |
| **JavaScript ES6** | Simulation logic & interactions |
| **CSS3** | Dark mode UI panel |
| **Vercel** | Hosting & deployment |

---

## 📊 Features

### Real-time Stock Simulation
- Stock levels update every **5 seconds**
- Random variation: -10% to +10%
- Colors change dynamically based on stock percentage

### Color Coding System

| Color | Stock Level | Meaning |
|-------|-------------|---------|
| 🟢 **Green** | 70-100% | High stock - Healthy |
| 🟡 **Yellow** | 30-70% | Medium stock - Monitor |
| 🔴 **Red** | 0-30% | Low stock - Reorder now |

### Interactive UI Panel
📊 INVENTORY SUMMARY
🟢 High stock (70-100%): 142
🟡 Medium stock (30-70%): 98
🔴 Low stock (0-30%): 60
📦 Total products: 300
✅ Fill rate: 47%

text

### IoT Live Feed Indicator
- **Pulsing green LED** shows "SYSTEM LIVE"
- Status messages rotate every 3 seconds
- Confirms real-time data simulation

### Camera Controls with Reset
- **Reset View button** returns to original camera position
- Perfect for exploring then recentering

---

## 📁 Project Structure
digital-twin-threejs/
├── index.html # Main page & UI structure
├── style.css # Dark mode styling
├── main.js # Three.js logic & simulation
└── README.md # Documentation

text

---

## 🚀 Run Locally

```bash
# Clone the repository
git clone https://github.com/KelvinW918/digital-twin-threejs.git

# Navigate to project
cd digital-twin-threejs

# Open index.html in your browser
# Or use any local server:
npx serve .
🏗️ Architecture
text
┌─────────────────────────────────────────────────────┐
│                     index.html                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Stats     │  │  3D Scene   │  │   Tooltip   │  │
│  │   Panel     │  │  (Three.js) │  │   Popup     │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   main.js   │
                    │  Simulation │
                    │  Raycaster  │
                    │   Controls  │
                    └─────────────┘
📈 Warehouse Specifications
Parameter	Value
Racks	5 × 5 (25 total)
Levels per rack	3
Slots per level	4
Total products	300
Simulation interval	5 seconds
Stock range	0-100%
🔮 Future Improvements
Real IoT data via WebSockets

Historical data replay

Mobile touch controls

Product search & highlight

Export inventory reports

Multiple warehouse support

👤 Author
Kelvin W.
Systems Engineer · Product Architect

https://img.shields.io/badge/GitHub-KelvinW918-171515?style=flat-square&logo=github
https://img.shields.io/badge/LinkedIn-kelvin--williams-0A66C2?style=flat-square&logo=linkedin
https://img.shields.io/badge/Email-kelvinarturow918@gmail.com-EA4335?style=flat-square&logo=gmail

📄 License
MIT — Free for use, modification, and distribution.

<div align="center"> ⭐ If this helps you understand Digital Twins, give it a star! ⭐ </div> ```
