# 📖 RecipeBook

A full-stack recipe management app inspired by generations of women in my family passing down recipes. Built with React, Node.js, Express, and PostgreSQL.

🔗 **Live Demo:** [book-of-recipes.com](https://book-of-recipes.com)

*Add screenshots here*

---

## ✨ Features

### 🔐 Authentication
- **Register & Login** with email and password
- **Email verification** — new accounts require email confirmation before logging in
- **Forgot password** flow with tokenised, time-limited reset links
- **JWT-based sessions** persisted in localStorage

### 📝 Recipe Management
- **Create, edit, and delete** recipes with an intuitive form interface
- **Cloud storage** — recipes saved to a PostgreSQL database and synced across devices
- **Share recipes** — via native share menu (mobile) or clipboard copy (desktop)

### 🔢 Smart Portion Calculator
- **Automatic ingredient scaling** based on serving size adjustments
- Handles **whole numbers**, **decimals**, and **fractions**
- Intelligently converts decimals to common cooking fractions (e.g. 0.5 → 1/2)
- Excludes non-quantity numbers like temperatures (°C/°F) and percentages (%)
- Real-time updates as you adjust servings
- **Tip:** Works best when ingredients start with a quantity (e.g. "200g flour", "1/2 cup sugar")

### 🎲 Recipe Picker ("What's for Dinner?")
- **Smart filtering** by:
  - Maximum cooking time
  - Mood/category (Comfort Food, Light & Fresh, Quick & Easy, etc.)
  - Ingredients you have available
  - Ingredients you're missing (to exclude recipes you can't make)
- **Random selection** from filtered results
- Full recipe preview displayed in a modal

### 💬 Feedback
- In-app feedback form powered by **Formspree**

### 🎨 User Experience
- **Vintage cookbook aesthetic** with warm rose and parchment tones
- **Responsive design** — works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- **React** (v19) with hooks
- **Tailwind CSS** (v4) — utility-first styling
- **Vite** — build tool and dev server
- **Lucide React** — icon library

### Backend
- **Node.js** with **Express** — REST API
- **PostgreSQL** via **Neon** — serverless database
- **JWT** — authentication tokens
- **bcryptjs** — password hashing
- **Resend** — transactional email (verification + password reset)

### Testing
- **Vitest** — unit testing framework
- **React Testing Library** — component testing
- **@testing-library/user-event** — user interaction simulation

### Deployment
- **Railway** — full-stack hosting (client + server)
- **Neon** — serverless PostgreSQL database
- **Formspree** — feedback form handling

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- A PostgreSQL database (e.g. [Neon](https://neon.tech) free tier)
- A [Resend](https://resend.com) account for sending emails

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PatMikucka/recipe-cookbook.git
cd recipe-cookbook
```

2. **Install client dependencies**
```bash
cd client
npm install
```

3. **Install server dependencies**
```bash
cd ../server
npm install
```

4. **Set up environment variables**

Create a `.env` file in the `server/` directory:
```env
DATABASE_URL=your_neon_postgres_connection_string
JWT_SECRET=your_jwt_secret_key
RESEND_API_KEY=your_resend_api_key
PORT=3001
```

5. **Set up the database**

Run the following SQL to create the required tables:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  verify_token TEXT,
  reset_token TEXT,
  reset_token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  time INTEGER NOT NULL,
  servings INTEGER NOT NULL,
  mood TEXT,
  ingredients TEXT[] NOT NULL,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

6. **Start the development servers**

In one terminal (server):
```bash
cd server
npm run dev
```

In another terminal (client):
```bash
cd client
npm run dev
```

7. **Open your browser**
```
Navigate to http://localhost:5173
```

---

## 🧪 Testing

Tests live in `client/src/test/` and cover utility functions and UI components.

### Run Tests
```bash
cd client
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

**Utility Functions**
- `portionCalculator.js` — scaling logic, fraction conversion, edge cases (temperatures, percentages, ranges)
- `storage.js` — CRUD operations, input validation, error handling

**Components**
- `RecipeCard` — renders recipe info, handles view and share interactions
- `RecipeList` — renders lists and empty states, passes correct props to cards

---

## 📁 Project Structure

```
recipe-cookbook/
├── client/
│   └── src/
│       ├── components/
│       │   ├── AuthForm.jsx          # Login & registration
│       │   ├── ForgotPassword.jsx    # Password reset request
│       │   ├── ResetPassword.jsx     # Password reset form
│       │   ├── VerifyEmail.jsx       # Email verification handler
│       │   ├── RecipeCard.jsx        # Single recipe card
│       │   ├── RecipeForm.jsx        # Create/edit/view recipe + portion calculator
│       │   ├── RecipeList.jsx        # Recipe grid
│       │   ├── RecipePicker.jsx      # "What's for dinner?" feature
│       │   └── FeedbackForm.jsx      # User feedback (Formspree)
│       ├── utils/
│       │   ├── api.js                # Fetch wrapper with auth headers
│       │   ├── portionCalculator.js  # Ingredient scaling logic
│       │   └── storage.js            # API calls for recipe CRUD
│       ├── test/
│       │   ├── components/
│       │   ├── utils/
│       │   └── setup.js
│       ├── App.jsx                   # Root component & routing logic
│       └── main.jsx                  # Entry point
└── server/
    ├── db/
    │   └── index.js                  # PostgreSQL pool (Neon)
    ├── middleware/
    │   └── auth.js                   # JWT authentication middleware
    ├── routes/
    │   ├── auth.js                   # Register, login, verify, reset password
    │   └── recipes.js                # Recipe CRUD (protected)
    └── index.js                      # Express app setup
```

---

## 📝 Known Limitations

- **Portion calculator** works best when ingredients follow the format `[amount] [unit] [ingredient]`. Complex or freeform descriptions may not scale as expected.
- Email delivery depends on Resend and domain configuration — a verified sending domain is required in production.

---

## 👤 Author

**Patrycja Mikucka**
- GitHub: [github.com/PatMikucka](https://github.com/PatMikucka)
- LinkedIn: [linkedin.com/in/patrycja-mikucka](https://www.linkedin.com/in/patrycja-mikucka/)

---

## 🙏 Acknowledgments

- Inspired by generations of women in my family passing down recipes
- Icons by [Lucide](https://lucide.dev/)
- Built as part of my web development journey

---

## 📸 Screenshots

*Add screenshots of different sections!*

---

*Built with ❤️ and React*