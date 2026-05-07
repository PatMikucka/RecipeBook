import React, { useState } from 'react';
import { Sparkles, X, Clock, Utensils } from 'lucide-react';

const RecipePicker = ({ recipes, filters, setFilters, onPick, onViewRecipe }) => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [missingInput, setMissingInput] = useState('');
    const [availableInput, setAvailableInput] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handlePick = () => {
        const picked = onPick();
        if (picked) {
            setSelectedRecipe(picked);
            setShowModal(true);
        }
    };

    const addAvailableIngredient = () => {
        if (availableInput.trim()) {
            setFilters({
                ...filters,
                availableIngredients: [...(filters.availableIngredients || []), availableInput.trim()]
            });
            setAvailableInput('');
        }
    };

    const removeAvailableIngredient = (ing) => {
        setFilters({
            ...filters,
            availableIngredients: filters.availableIngredients.filter(i => i !== ing)
        });
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
            <div className='bg-card rounded-lg shadow-xl border-2 border-blush p-8 mb-6'>
                <h2 className='text-3xl font-serif text-burgundy mb-6 text-center'>
                    <Sparkles className='w-8 h-8 inline mr-2' />
                    What Should I Make?
                </h2>
                <div className='space-y-6'>

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>
                            Maximum Time (minutes): {filters.maxTime}
                        </label>
                        <input
                            type='range'
                            min='10'
                            max='180'
                            step='10'
                            value={filters.maxTime}
                            onChange={(e) => setFilters({ ...filters, maxTime: parseInt(e.target.value) })}
                            className='w-full accent-rose-deep'
                        />
                        <div className='flex justify-between text-sm text-rose mt-1'>
                            <span>10 min</span>
                            <span>3 hours</span>
                        </div>
                    </div>

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>Mood</label>
                        <div className='flex flex-wrap gap-2'>
                            {['Comfort Food', 'Light & Fresh', 'Quick & Easy', 'Special Occasion', 'Hearty', 'Healthy', ''].map((mood) => (
                                <button
                                    key={mood || 'any'}
                                    onClick={() => setFilters({ ...filters, mood })}
                                    className={`px-4 py-2 rounded-full transition ${
                                        filters.mood === mood
                                            ? 'bg-fig text-card'
                                            : 'bg-blush text-burgundy hover:opacity-80'
                                    }`}
                                >
                                    {mood || 'Any Mood'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>Ingredients I Have</label>
                        <div className='flex gap-2 mb-3'>
                            <input
                                type='text'
                                value={availableInput}
                                onChange={(e) => setAvailableInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addAvailableIngredient()}
                                placeholder='e.g., chicken, tomatoes'
                                className='flex-1 px-4 py-2 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card'
                            />
                            <button
                                onClick={addAvailableIngredient}
                                className='px-4 py-2 bg-rose-deep text-card rounded-lg hover:opacity-90 transition'
                            >
                                Add
                            </button>
                        </div>
                        {filters.availableIngredients?.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                                {filters.availableIngredients.map((ing) => (
                                    <span key={ing} className='px-3 py-1 bg-blush text-burgundy rounded-full text-sm flex items-center gap-2'>
                                        {ing}
                                        <button onClick={() => removeAvailableIngredient(ing)}>
                                            <X className='w-4 h-4' />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className='block text-burgundy font-medium mb-2'>Ingredients I'm Missing</label>
                        <div className='flex gap-2 mb-3'>
                            <input
                                type='text'
                                value={missingInput}
                                onChange={(e) => setMissingInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addMissingIngredient()}
                                placeholder='e.g., cream, parmesan'
                                className='flex-1 px-4 py-2 border-2 border-blush rounded-lg focus:border-rose focus:outline-none bg-card'
                            />
                            <button
                                onClick={addMissingIngredient}
                                className='px-4 py-2 bg-rose-deep text-card rounded-lg hover:opacity-90 transition'
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
                        className='w-full px-6 py-4 bg-fig text-card rounded-lg hover:opacity-90 transition font-medium text-lg shadow-lg'
                    >
                        <Sparkles className='w-6 h-6 inline mr-2' />
                        Pick a Recipe for Me!
                    </button>

                </div>
            </div>

            {showModal && selectedRecipe && (
                <div
                    className='fixed inset-0 flex items-center justify-center z-50 p-4'
                    style={{backgroundColor: 'rgba(61, 26, 64, 0.5)'}}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className='bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='bg-rose p-6 border-b-2 border-rose relative'>
                            <button
                                onClick={() => setShowModal(false)}
                                className='absolute top-4 right-4 w-8 h-8 rounded-full bg-card text-burgundy flex items-center justify-center hover:opacity-80 transition border border-blush'
                            >
                                <X className='w-4 h-4' />
                            </button>
                            <h3 className='text-2xl font-serif text-card mb-2 pr-10'>{selectedRecipe.title}</h3>
                            {selectedRecipe.mood && (
                                <span className='inline-block px-3 py-1 bg-card text-burgundy rounded-full text-sm opacity-80'>
                                    {selectedRecipe.mood}
                                </span>
                            )}
                        </div>

                        <div className='p-6'>
                            <div className='flex gap-6 text-rose mb-6'>
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
                                <h4 className='text-lg font-serif text-burgundy mb-3'>Ingredients</h4>
                                <ul className='space-y-2'>
                                    {selectedRecipe.ingredients.map((ing, i) => (
                                        <li key={i} className='flex items-start gap-2 text-burgundy'>
                                            <span className='w-1.5 h-1.5 rounded-full bg-rose mt-2 flex-shrink-0'></span>
                                            {ing}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='flex flex-col gap-3'>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        onViewRecipe(selectedRecipe);
                                    }}
                                    className='w-full px-6 py-3 bg-rose-deep text-card rounded-lg hover:opacity-90 transition font-medium'
                                >
                                    View Full Recipe
                                </button>
                                <button
                                    onClick={handlePick}
                                    className='w-full px-6 py-3 bg-blush text-burgundy rounded-lg hover:opacity-80 transition font-medium'
                                >
                                    Pick Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipePicker;