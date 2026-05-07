import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import AuthForm from './components/AuthForm';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipePicker from './components/RecipePicker';
import VerifyEmail from './components/VerifyEmail';
import { loadAllRecipes, saveRecipe as saveRecipeToStorage, deleteRecipe as deleteRecipeFromStorage } from './utils/storage';

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [view, setView] = useState('list');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [pickerFilters, setPickerFilters] = useState({
    maxTime: 60,
    availableIngredients: [],
    missingIngredients: [],
    mood: ''
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      loadRecipes();
    }
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      loadRecipes();
    }
  }, [user]);

  const loadRecipes = async () => {
    try {
      const recipes = await loadAllRecipes();
      setRecipes(recipes);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      alert('Failed to load recipes. Please refresh the page.');
    }
  };

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    loadRecipes();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setRecipes([]);
  };

  const saveRecipe = async (recipe) => {
    try {
      await saveRecipeToStorage(recipe);
      await loadRecipes();
      setEditingRecipe(null);
      setView('list');
    } catch (error) {
      console.error('Failed to save recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await deleteRecipeFromStorage(id);
      await loadRecipes();
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const shareRecipe = (recipe) => {
    const shareText = `📖 ${recipe.title}\n\n🕐 ${recipe.time} mins | 🍽️ Serves ${recipe.servings}\n\n📝 Ingredients:\n${recipe.ingredients.join('\n')}\n\n👨‍🍳 Instructions:\n${recipe.instructions}`;
    if (navigator.share) {
      navigator.share({ title: recipe.title, text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Recipe copied to clipboard!');
    }
  };

  const pickRandomRecipe = () => {
    let filtered = recipes.filter(r => r.time <= pickerFilters.maxTime);
    if (pickerFilters.mood) {
      filtered = filtered.filter(r => r.mood === pickerFilters.mood);
    }
    if (pickerFilters.availableIngredients.length > 0) {
      filtered = filtered.filter(r =>
        pickerFilters.availableIngredients.every(available =>
          r.ingredients.some(ing =>
            ing.toLowerCase().includes(available.toLowerCase())
          )
        )
      );
    }
    if (pickerFilters.missingIngredients.length > 0) {
      filtered = filtered.filter(r =>
        !r.ingredients.some(ing =>
          pickerFilters.missingIngredients.some(missing =>
            ing.toLowerCase().includes(missing.toLowerCase())
          )
        )
      );
    }
    if (filtered.length === 0) {
      alert('No recipes match your criteria. Try adjusting the filters!');
      return null;
    }
    return filtered[Math.floor(Math.random() * filtered.length)];
  };

  if (window.location.pathname === '/verify') {
    return <VerifyEmail onContinue={() => window.location.href = '/'} />;
  }

  if (authLoading) {
    return (
      <div className='min-h-screen bg-parchment flex items-center justify-center'>
        <BookOpen className='w-12 h-12 text-rose animate-pulse' />
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className='min-h-screen bg-parchment p-4'>
      <div className='max-w-6xl mx-auto'>

        {/* Header */}
        <div className='text-center mb-8 pt-6'>
          <div className='flex items-center justify-center gap-3 mb-2'>
            <BookOpen className='w-10 h-10 text-rose' />
            <h1 className='text-5xl font-serif text-burgundy'>My Recipe Book</h1>
          </div>
          <p className='text-rose italic'>A collection of treasured recipes</p>
          <p className='text-burgundy text-sm mt-1 opacity-70'>Signed in as {user?.email}</p>
          <button
            onClick={handleLogout}
            className='mt-3 px-4 py-2 bg-blush text-burgundy rounded-lg hover:opacity-80 transition text-sm'>
            Sign Out
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className='flex gap-3 mb-6 flex-wrap justify-center'>
          <button
            onClick={() => setView('list')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'list'
                ? 'bg-fig text-card shadow-lg'
                : 'bg-blush text-burgundy hover:opacity-80'
            }`}
          >
            <BookOpen className='w-5 h-5 inline mr-2' />
            All Recipes
          </button>

          <button
            onClick={() => { setEditingRecipe({}); setView('edit'); }}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'edit'
                ? 'bg-fig text-card shadow-lg'
                : 'bg-blush text-burgundy hover:opacity-80'
            }`}
          >
            <Plus className='w-5 h-5 inline mr-2' />
            New Recipe
          </button>

          <button
            onClick={() => setView('picker')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'picker'
                ? 'bg-fig text-card shadow-lg'
                : 'bg-blush text-burgundy hover:opacity-80'
            }`}
          >
            <Sparkles className='w-5 h-5 inline mr-2' />
            What's for Dinner?
          </button>
        </div>

        {/* Recipe List View */}
        {view === 'list' && (
          <RecipeList
            recipes={recipes}
            onViewRecipe={(recipe) => { setEditingRecipe(recipe); setView('edit'); }}
            onShareRecipe={shareRecipe}
          />
        )}

        {/* Recipe Form View */}
        {view === 'edit' && (
          <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 max-w-3xl mx-auto'>
            <h2 className='text-3xl font-serif text-burgundy mb-6'>
              {editingRecipe?.id ? 'Edit Recipe' : 'New Recipe'}
            </h2>
            <RecipeForm
              recipe={editingRecipe}
              onSave={saveRecipe}
              onCancel={() => { setEditingRecipe(null); setView('list'); }}
              onDelete={editingRecipe?.id ? () => { deleteRecipe(editingRecipe.id); setView('list'); } : null}
            />
          </div>
        )}

        {/* Recipe Picker View */}
        {view === 'picker' && (
          <RecipePicker
            recipes={recipes}
            filters={pickerFilters}
            setFilters={setPickerFilters}
            onPick={pickRandomRecipe}
            onViewRecipe={(recipe) => { setEditingRecipe(recipe); setView('edit'); }}
          />
        )}
      </div>
    </div>
  );
};

export default App;