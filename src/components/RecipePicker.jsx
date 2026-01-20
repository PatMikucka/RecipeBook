import React, { useState} from 'react';
import { Sparkles, X, Heart, Clock, Utensils } from 'lucide-react';

const RecipePicker = ({ recipes, filters, setFilters, onPick }) => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [missingInput, setMissingInput] = useState('');
    const handlePick = () => {
        const picked = onPick();
        if (picked) setSelectedRecipe(picked);
    };

    const addMissingIngredient = () => {
        if (missingInput.trim()) {
            setFilters({
                ...filters,
                missingIngredients: [...filters.missingIngredients, missingInput.trim()]
            });
            setMissingInput('');
        }
    };

    const removeMissingIngredient = (ing) => {
        setFilters({
            ...filters,
            missingIngredients: filters.missingIngredients.filter(i => i !== ing)
        });
    };

    return (
        <div className='max-w-3xl mx-auto'>
            <div className='bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8 mb-6'>
                <h2 className='text-3xl font-serif text-amber-900 mb-6 text-center'>
                    <Sparkles className='w-8 h-8 inline mr-2' />
                    What Should I Make?
                </h2>
                <div className='space-y-6'>
                    <div>
                        <label className='block text-amber-900 font-medium mb-2'>
                            Maximum Time (minutes): {filters.maxTime}
                        </label>
                        <input
                            type='range'
                            min='10'
                            max='180'
                            step='10'
                            value={filters.maxTime}
                            onChange={(e) => setFilters({ ...filters, maxTime: parseInt(e.target.value) })}
                            className='w-full'
                        />
                        <div className='flex justify-between text-sm text-amber-600 mt-1'>
                            <span>10 min</span>
                            <span>3 hours</span>
                        </div>
                    </div>
                    <div>
                        <label className='block text-amber-900 font-medium mb-2'>Mood</label>
                        <div className='flex flex-wrap gap-2'>
                            {['Comfort Food', 'Light & Fresh', 'Quick & Easy', 'Special Occasion', 'Hearty', 'Healthy', ''].map((mood) => (
                                <button
                                    key={mood || 'any'}
                                    onClick={() => setFilters({ ...filters, mood})}
                                    className={`px-4 py-2 rounded-full transition ${
                                        filters.mood === mood
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    }`}
                                    >
                                        {mood || 'Any Mood'}
                                    </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className='block text-amber-900 font-medium mb-2'>Missing Ingredients</label>
                        <div className='flex gap-2 mb-3'>
                            <input
                                type='text'
                                value={missingInput}
                                onChange={(e) => setMissingInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addMissingIngredient()}
                                placeholder='e.g., chicken, tomatoes'
                                className='flex-1 px-4 py-2 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none'
                            />
                            <button
                                onClick={addMissingIngredient}
                                className='px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition'
                            >
                                Add
                            </button>
                        </div>
                        {filters.missingIngredients.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {filters.missingIngredients.map((ing) => (
                                    <span key={ing} className='px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2'>
                                        {ing}
                                        <button onClick={() => removeMissingIngredient(ing)}>
                                            <X className='w-4 h-4' />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handlePick}
                        className='w-full px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover-to-amber-800 transition font-medium text-lg shadow-lg'
                    >
                        <Sparkles className='w-6 h-6 inline mr-2' />
                        Pick a Recipe for Me!
                    </button>
                </div>
            </div>

            {selectedRecipe && (
                <div className='bg-white rounded-lg shadow-xl border-2 border-amber-200 p-8'>
                    <div className='text-center mb-6'>
                        <Heart className='w-12 h-12 text-red-500 mx-auto mb-3 animate-pulse' />
                        <h3 className='text-3xl font-serif text-amber-900 mb-2'>{selectedRecipe.title}</h3>
                        {selectedRecipe.mood && (
                            <span className='inline-block px-4 py-2 bg-amber-200 text-amber-800 rounded-full'>
                                {selectedRecipe.mood}
                            </span>
                        )}
                    </div>

                    <div className='flex gap-6 justify-center text-amber-700 mb-6'>
                        <span className='flex items-center gap-2'>
                            <Clock className='w-5 h-5' />
                            {selectedRecipe.time} minutes
                        </span>
                        <span className='flex items-center gap-2'>
                            <Utensils className='w-5 h-5' />
                            Serves {selectedRecipe.servings}
                        </span>
                    </div>

                    <div className='mb-6'>
                        <h4 className='text-xl font-serif text-amber-900 mb-3'>Ingredients:</h4>
                        <ul className='list-disc list-inside space-y-1 text-amber-800'>
                            {selectedRecipe.ingredients.map((ing, i) => (
                                <li key={i}>{ing}</li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className='text-xl font-serif text-amber-900 mb-3'>Instructions:</h4>
                        <p className='text-amber-800 whitespace-pre-line leading-relaxed'>{selectedRecipe.instructions}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipePicker;
