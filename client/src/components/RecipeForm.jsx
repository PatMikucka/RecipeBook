import React, { useState } from 'react';
import { X, Check, Users } from 'lucide-react';
import { scaleIngredient } from '../utils/portionCalculator';

const RecipeForm = ({ recipe, onSave, onCancel, onDelete }) => {
    
    const [formData, setFormData] = useState({
        title: recipe?.title || '',
        time: recipe?.time || 30,
        servings: recipe?.servings || 4,
        mood: recipe?.mood || '',
        ingredients: recipe?.ingredients || [''],
        instructions: recipe?.instructions || '',
        id: recipe?.id
    });

    const [viewServings, setViewServings] = useState(recipe?.servings || 4);
    const [isViewing, setIsViewing] = useState(!!recipe?.id);

    const moods = ['Comfort Food', 'Light & Fresh', 'Quick & Easy', 'Special Occasion', 'Hearty', 'Healthy'];

    const getScaledIngredients = () => {
        if (!isViewing || viewServings === formData.servings) {
            return formData.ingredients;
        }
        return formData.ingredients.map(ing =>
            scaleIngredient(ing, formData.servings, viewServings)
        );
    };

    const updateIngredient = (index, value) => {
        const newIngredients = [...formData.ingredients];
        newIngredients[index] = value;
        setFormData({ ...formData, ingredients: newIngredients });
    };

    const addIngredient = () => {
        setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
    };

    const removeIngredient = (index) => {
        setFormData({
            ...formData,
            ingredients: formData.ingredients.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    const scaledIngredients = getScaledIngredients();
    
    return (
        <div>
            {/* Portion Calculator */}
            {isViewing && (
                <div className="mb-6 p-4 bg-blush border-2 border-rose rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-burgundy font-medium flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Adjust Servings:
                        </label>
                        <button 
                            onClick={() => setIsViewing(false)}
                            className="px-4 py-2 bg-rose-deep text-card rounded-lg hover:opacity-90 transition text-sm"
                        >
                            Edit Recipe
                        </button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <button
                            onClick={() => setViewServings(Math.max(1, viewServings - 1))}
                            className="px-4 py-2 bg-card border-2 border-rose text-burgundy rounded-lg hover:bg-blush transition font-bold text-xl"
                        >
                            −
                        </button>

                        <div className="text-center">
                            <div className="text-3xl font-bold text-burgundy">{viewServings}</div>
                            <div className="text-sm text-rose">servings</div>
                        </div>

                        <button 
                            onClick={() => setViewServings(viewServings + 1)}
                            className="px-4 py-2 bg-card border-2 border-rose text-burgundy rounded-lg hover:bg-blush transition font-bold text-xl"
                        >
                            +
                        </button>

                        <button
                            onClick={() => setViewServings(formData.servings)}
                            className="mt-2 w-full px-4 py-2 bg-card text-burgundy border-2 border-rose rounded-lg hover:bg-blush transition text-sm"
                        >
                            Reset to Original ({formData.servings})
                        </button>
                    </div>

                    {viewServings !== formData.servings && (
                        <div className="mt-3 text-center text-rose text-sm">
                            Ingredients were adjusted from {formData.servings} to {viewServings}
                        </div>
                    )}
                </div>
            )}

            <div className="space-y-6">

                {/* Recipe Title */}
                <div>
                    <label className="block text-burgundy font-medium mb-2">Recipe Title</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card"
                        required
                        disabled={isViewing}
                    />
                </div>

                {/* Time and servings */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-burgundy font-medium mb-2">Time (minutes)</label>
                        <input
                            type="number"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card"
                            required
                            disabled={isViewing}
                        />
                    </div>
                    <div>
                        <label className="block text-burgundy font-medium mb-2">Servings</label>
                        <input
                            type="number"
                            value={formData.servings}
                            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                            required
                            disabled={isViewing}
                            className="w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card"
                        />
                    </div>
                </div>

                {/* Mood/category */}
                <div>
                    <label className="block text-burgundy font-medium mb-2">Vibe</label>
                    <div className="flex flex-wrap gap-2">
                        {moods.map((mood) => (
                            <button
                                key={mood}
                                onClick={() => !isViewing && setFormData({ ...formData, mood: formData.mood === mood ? '' : mood })}
                                className={`px-4 py-2 rounded-full transition ${
                                    formData.mood === mood
                                        ? 'bg-fig text-card'
                                        : 'bg-blush text-burgundy hover:opacity-80'
                                } ${isViewing ? 'cursor-default' : 'cursor-pointer'}`}
                                disabled={isViewing}
                            >
                                {mood}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ingredients */}
                <div>
                    <label className="block text-burgundy font-medium mb-2">Ingredients</label>
                    <p className='text-sm text-rose italic mb-2'>
                        💡 Tip: Start with the amount for accurate portion scaling (e.g., "200g flour")
                    </p>

                    {isViewing ? (
                        <div className="space-y-2">
                            {scaledIngredients.map((ing, index) => (
                                <div key={index} className="px-4 py-3 bg-card border-2 border-blush rounded-lg text-burgundy">
                                    {ing}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {formData.ingredients.map((ing, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={ing}
                                        onChange={(e) => updateIngredient(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card"
                                        placeholder="e.g., 200g flour, 1/2 tsp salt"
                                        required
                                    />
                                    {formData.ingredients.length > 1 && (
                                        <button
                                            onClick={() => removeIngredient(index)}
                                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={addIngredient}
                                className="mt-2 px-4 py-2 bg-blush text-burgundy rounded-lg hover:opacity-80 transition"
                            >
                                + Add Ingredient
                            </button>
                        </>
                    )}
                </div>

                {/* Instructions */}
                <div>
                    <label className="block text-burgundy font-medium mb-2">Instructions</label>
                    {isViewing ? (
                        <div className="px-4 py-3 bg-card border-2 border-blush rounded-lg whitespace-pre-line text-burgundy">
                            {formData.instructions}
                        </div>
                    ) : (
                        <textarea
                            value={formData.instructions}
                            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card h-40"
                            required
                        />
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    {!isViewing && (
                        <>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium"
                            >
                                <Check className="w-5 h-5 inline mr-2" />
                                Save Recipe
                            </button>
                            <button
                                onClick={onCancel}
                                className="px-6 py-3 bg-blush text-burgundy rounded-lg hover:opacity-80 transition"
                            >
                                Cancel
                            </button>
                            {onDelete && (
                                <button
                                    onClick={onDelete}
                                    className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                >
                                    Delete
                                </button>
                            )}
                        </>
                    )}
                    {isViewing && (
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 bg-blush text-burgundy rounded-lg hover:opacity-80 transition"
                        >
                            Back to Recipes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipeForm;