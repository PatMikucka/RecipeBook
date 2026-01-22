import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Sparkles } from 'lucide-react';
import RecipeList from './components/RecipeList';
import RecipeForm from './components/RecipeForm';
import RecipePicker from './components/RecipePicker';
import { loadAllRecipes, saveRecipe as saveRecipeToStoragr, deleteRecipe as deleteRecipeFromStorage } from './utils/storage';

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [view, setView] = useState('list');
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [pickerFilters, setPickerFilters] = useState({
    maxTime: 60,
    missingIngredients: [],
    mood: ''
  });
  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const recipes = await loadAllRecipes();
    setRecipes(recipes);
  };

  const saveRecipe = async (recipe) => {
    await saveRecipeToStoragr(recipe);
    await loadRecipes();
    setEditingRecipe(null);
    setView('list');
  };

  const deleteRecipe = async (id) => {
    await deleteRecipeFromStorage(id);
    await loadRecipes();
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

  return (
    <div className='min-h-screen bg-amber-50 p-4'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-8 pt-6'>
          <div className='flex items-center justify-center gap-3 mb-2'>
            <BookOpen className='w-10 h-10 text-amber-700' />
            <h1 className='text-5xl font-serif text-amber-900'>My Recipe Book</h1>
          </div>
          <p className='text-amber-700 italic'>A collection of treasured recipes</p>
        </div>
        {/* Navigation Buttons */}
        <div className='flex gap-3 mb-6 flex-wrap justify-center'>
          <button
            onClick={() => setView('list')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'list'
                ? 'bg-amber-700 text-white shadow-lg'
                : 'bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-400'
            }`}
          >
            <BookOpen className='w-5 h-5 inline mr-2' />
            All Recipes
          </button>

          <button
            onClick={() => { setEditingRecipe({}); setView('edit'); }}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'edit'
                ? 'bg-amber-700 text-white shadow-lg'
                : 'bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-400'
            }`}
          >
            <Plus className='w-5 h-5 inline mr-2' />
            New Recipe
          </button>

          <button
            onClick={() => setView('picker')}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              view === 'picker'
                ? 'bg-amber-700 text-white shadow-lg'
                : 'bg-white text-amber-700 border-2 border-amber-200 hover:border-amber-400'
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
          <div className='bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8 max-w-3xl mx-auto'>
            <h2 className='text-3xl font-serif text-amber-900 mb-6'>
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
          />
        )}
      </div>
    </div>
  );
};

export default App;
