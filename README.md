# 📖 RecipeBook

A vintage-inspired recipe managment application built with React and Tailwind CSS.

*Add screenshots here*

---

## ✨ Features

### 📝 Recipe Managment
- **Create, Edit, and Delete** recipes with intuitive form interface
- **Persistent Storage** - All recipes saved locally using browser storage API
- **Share Recipes** - Share via native share menu (mobile) or clipboard (desktop)

### 🔢 Smart Portion Calculator
- **Automatic ingredient scaling** based on serving size adjustments
- Handles **whole numbers**, **decimals**, and **fractions**
- Intelligently converts decimals to common cooking fractions
- Real-time updates as you adjust servings
- **Note** Works best wneh ingredients start witg quantities (e.g., "200g flour, 1 cup sugar")

### 🎲 Recipe Picker ("What's for Dinner?")
- **Smart filtering** by:
    - Maximum cooking time
    - Mood/Category (Comfort Food, Light & Fresh, ect.)
    - Missing ingredients (exclude recipes you can't make)
- **Random selection** from filtered results
- Full recipe details displayed instantly

### 🎨 User Experience
- **Vintage cookbook aesthetic** with warm amber tones
- **Responsive design** - works beautifully on desktop, tablet, and mobile
- **Empty states** with helpful prompts for new users

---

## 🛠️ Technologies Used

- **React** (v19) - UI component with hooks
- **Tailwind CSS** (v4) - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing utilities
- **Lucide React** - Beautiful icon library
- **Browser Storage API** - Client-side data persistance

---

## 🚀 Gettting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Instalation

1. **Clone the repository**
```bash
    git clone
    cd recipe-cookbook
```

2. **Install dependancies**
```bash
    npm install
```

3. **Start the development server**
```bash
    npm run dev
```

4. **Open your browser**
```bash
    Navigate to http://localhost:5173
```

---

## 🧪 Testing

This project includes comprehensive unit tests for utility functions and components.

### Run Tests
```bash
    npm test
```

### Run Tests with UI
```bash
    npm run test:ui
```

### Generate Coverage Report
```bash
    npm run test:coverage
```

### Test Coverage

**Current Coverage: ~ xx%**

## Utility Functions: 100% coverage
    - Portion calculator (ingredient scaling logic)
    - Storage operations (CRUD for recipes)

## Components: xx% coverage
    - Recipe form validation and submission
    - Recipe list rendering and interactions
    - Recipe picker filtering and selection

---

## 📁 Project Structure
```

recipe-cookbook/
|-- src/
|   |--components/      # React components
|   |   |-- RecipeCard.jsx
|   |   |-- RecipeForm.jsx
|   |   |-- RecipeList.jsx
|   |   |-- RecipePicker.jsx
|   |-- utils/          # Helper functions
|   |   |-- portionCalculator.js
|   |   |-- storage.js
|   |-- test/           # Test files
|   |   |-- components/
|   |   |-- utils/
|   |   |-- setup.js
|   |-- App.jsx         # Main app component
|   |--main.jsx         # App entry point
|-- public/
|-- package.json
|-- README.md
```

---

## 🎯 Key Learning Outcomes

### React & State Managment
- Complex state managment with multiple `useState` and `useEffect` hooks
- Component composition and props drilling
- Controlled form inputs with validation
- Conditional rendering patterns

### Algorithm Design
- **Portion scaling algorithm** with regex parsing
- Decimal to fraction conversion for common cooking measurements
- Random selection with multiple filter criteria

### Testing
- Unit testing pure functions with Vitest
- Component testing with React Testing Library
- Mocking browser APIs for isolated tests
- Test-driven development practices

### Code organisation
- Separation of concerns (UI vs logic)
- Reusable utility functions
- Professional project structure
- CClear documentation with JSDoc comments

---

## 📝 Known Limitations & Future Enhancements

### Current Limitations

**Portion Calculator:**
- Works best when ingredients follow standard format: `[amount] [unit] [ingredient]`
- May scale non-quantity numbers in edge cases (e.g., "85" in "85% chocolate" spelled without symbol)
- Percentages (%) and temperatures (°) are excluded from scaling

**Data Storage:**
- Recipes stored locally in browser (not synced across devices)
- No data backup or export functionality

### Planned Enchantments

- Recipe photo uploads
- Advanced tagging and categorisation
- Full-text search functionality
- Export/inport recipes as JSON or PDF
- Nutritional information calculator
- Shopping list generator
- Cloud sync with user accounts
- Dark mode support

---

## 🤝 Contributing

This is a personal portfolio project showcasing my development skills.

**Feedback welcome!** Found a bug or have suggestions? Open an issue.

**Want to build something similar?** Feel free to fork this repo for learning purposes, but please don't present it as your own work.

---

## 📄 License

MIT License - See LICENSE file for details.
**TL;DR** Free to use for personal/educational purposes with attributions.
---

## 👤 Author

**Patrycja Mikucka**

- GitHub: https://github.com/PatMikucka
- LinkedIn: https://www.linkedin.com/in/patrycja-mikucka/

---

## 🙏 Acknowledgments

- Inspired by generations of women in my family passing down recipes
- Icons by [Lucide](https://lucide.dev/)
- Built as part of my web development journey

---

## 📸 Screenshots

*Add screenshots of different sections!*

---

**Build with ❤️ and React**