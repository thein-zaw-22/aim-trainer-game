# 🎯 Aim Trainer Game

A fast-paced browser-based aim training game built with vanilla JavaScript and HTML5 Canvas. Test your mouse accuracy and reflexes by clicking targets before they disappear. Features multiple difficulty levels, combo system, audio feedback, and high-DPI rendering for crisp visuals.

![Aim Trainer Game](https://img.shields.io/badge/Game-Aim%20Trainer-blue?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Modern-purple?style=for-the-badge&logo=css3)

## 🎮 Features

- **🎯 4 Difficulty Levels**: Easy, Normal, Hard, Insane with progressively faster spawn rates and smaller targets
- **⏱️ Timed Gameplay**: 45-second intense sessions to test your skills
- **🔥 Combo System**: Build combos for bonus points and maintain momentum
- **📊 Real-time Statistics**: Track score, accuracy, hits, shots, escaped targets, and current combo
- **🔊 Audio Feedback**: Immersive sound effects using WebAudio API
- **🎨 Modern UI**: Sleek dark theme with smooth animations and visual effects
- **♿ Accessibility**: Screen reader support and keyboard controls
- **📱 Responsive Design**: High-DPI canvas support for crisp visuals on all displays
- **💾 Score Persistence**: Local storage saves your best score
- **⏸️ Pause/Resume**: Take breaks when needed with spacebar or pause button

## 🚀 Quick Start

1. **Clone or Download** the repository
2. **Open** `index.html` in your web browser
3. **Click "Play"** to start training your aim!

No build process, dependencies, or installation required - just pure vanilla web technologies.

## 🎯 How to Play

1. **Select Difficulty**: Choose from Easy, Normal, Hard, or Insane
2. **Click "Start"**: Begin your 45-second training session
3. **Aim & Click**: Hit the glowing targets before they disappear
4. **Build Combos**: Consecutive hits multiply your score
5. **Avoid Misses**: Missing breaks your combo streak
6. **Watch the Timer**: Race against the clock to maximize your score

### Scoring System
- **Base Points**: 80 points per hit
- **Size Bonus**: Smaller targets = more points (up to 120 bonus)
- **Combo Multiplier**: Each consecutive hit adds up to 80 bonus points
- **Accuracy Matters**: Missing targets breaks your combo

### Controls
- **Mouse**: Click targets to score points
- **Spacebar**: Pause/Resume game
- **Pause Button**: Alternative pause control
- **Mute Toggle**: Turn sound effects on/off

## 🛠️ Technical Details

### Tech Stack
- **Frontend**: Vanilla JavaScript (ES6+)
- **Graphics**: HTML5 Canvas with high-DPI support
- **Styling**: CSS3 with custom properties and modern layouts
- **Audio**: WebAudio API for dynamic sound generation
- **Storage**: Local Storage for score persistence

### Architecture
- **Modular Design**: Clean separation of game logic, rendering, and UI
- **Performance Optimized**: Efficient canvas rendering with requestAnimationFrame
- **Responsive**: Adapts to different screen sizes and pixel densities
- **Accessible**: ARIA labels and screen reader announcements

### Key Components
- **Game Engine**: Main loop with target spawning, collision detection, and scoring
- **Rendering System**: High-DPI canvas with smooth animations and visual effects
- **Audio System**: Dynamic sound generation for hits, misses, and UI feedback
- **UI Layer**: Real-time statistics display and game controls
- **State Management**: Game state, difficulty settings, and persistence

## 📁 Project Structure

```
aim-trainer-game/
├── index.html          # Main HTML file with game structure
├── game.js            # Core game logic and canvas rendering
├── style.css          # Modern styling with dark theme
└── README.md          # This documentation
```

## 🎨 Customization

### Difficulty Tuning
Modify the difficulty presets in `game.js`:

```javascript
const presets = {
  easy:   { spawnEvery: 1.1, minR: 24, maxR: 54, lifespan: 3.0, max: 4 },
  normal: { spawnEvery: 0.9, minR: 18, maxR: 42, lifespan: 2.5, max: 5 },
  hard:   { spawnEvery: 0.75, minR: 16, maxR: 36, lifespan: 2.0, max: 6 },
  insane: { spawnEvery: 0.62, minR: 12, maxR: 28, lifespan: 1.7, max: 7 },
};
```

### Visual Customization
Adjust colors and styling in `style.css` using CSS custom properties:

```css
:root {
  --bg: #0f1222;
  --accent: #7c98ff;
  --accent-2: #4be3c2;
  --danger: #ff6b6b;
  --ok: #7dff9e;
}
```

### Audio Settings
Modify sound parameters in the `beep()` function:

```javascript
beep({ freq: 720, dur: 0.05, type: 'square', gain: 0.06 });
```

## 🌟 Features in Detail

### High-DPI Canvas Rendering
The game automatically detects device pixel ratio and renders at the appropriate resolution for crisp visuals on all displays.

### Dynamic Target Spawning
Targets spawn at varying intervals based on difficulty, with different sizes and lifespans to create engaging gameplay.

### Visual Effects
- **Target Glow**: Subtle pulsing effects and life indicators
- **Hit Splashes**: Visual feedback for successful hits
- **Floating Text**: Score and combo feedback
- **Crosshair**: Mouse position indicator

### Accessibility Features
- **Screen Reader Support**: ARIA live regions for game announcements
- **Keyboard Controls**: Spacebar for pause/resume
- **High Contrast**: Clear visual hierarchy and readable text
- **Reduced Motion**: Respects user's motion preferences

## 🎯 Performance Optimizations

- **Efficient Rendering**: Uses requestAnimationFrame for smooth 60fps gameplay
- **Object Pooling**: Reuses visual effect objects to minimize garbage collection
- **Canvas Optimization**: High-DPI scaling without performance impact
- **Audio Efficiency**: Minimal WebAudio usage with short, optimized sounds

## 🚀 Deployment

### Local Development
Simply open `index.html` in any modern web browser. No server required!

### Web Deployment
Upload the files to any web hosting service:
- **GitHub Pages**: Push to a GitHub repository and enable Pages
- **Netlify**: Drag and drop the folder for instant deployment
- **Vercel**: Connect your repository for automatic deployments
- **Traditional Hosting**: Upload to any web server

### Integration
The game can be easily integrated into existing web projects:
- Drop into a Django template
- Embed in a React/Vue component
- Include in any static site generator

## 🤝 Contributing

Contributions are welcome! Here are some ideas:
- **New Game Modes**: Different target patterns or scoring systems
- **Visual Enhancements**: Additional effects or themes
- **Audio Improvements**: More sound variety or music
- **Mobile Support**: Touch controls for mobile devices
- **Multiplayer**: Competitive or cooperative modes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with vanilla web technologies for maximum compatibility
- Inspired by classic aim training games and FPS warm-up routines
- Designed for accessibility and performance

---

**Ready to improve your aim?** 🎯 [Start playing now!](index.html)

*Perfect for gamers, developers, or anyone looking to test their mouse accuracy and reflexes.*
