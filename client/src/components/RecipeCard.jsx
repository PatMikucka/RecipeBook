import React from 'react';
import { Clock, Utensils, Share2 } from 'lucide-react';

const RecipeCard = ({ recipe, onView, onShare }) => {
    return (
        <div className='bg-card rounded-lg shadow-sm border-2 border-blush overflow-hidden hover:shadow-xl transition-shadow'>
            <div className='bg-rose p-4 border-b-2 border-rose'>
                <h3 className='text-xl font-serif font-bold text-card'>{recipe.title}</h3>
                {recipe.mood && (
                    <span className='inline-block mt-2 px-3 py-1 bg-card text-burgundy rounded-full text-sm opacity-80'>
                        {recipe.mood}
                    </span>
                )}
            </div>

            <div className='p-4'>
                <div className='flex gap-4 text-sm text-rose mb-3'>
                    <span className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        {recipe.time} min
                    </span>
                    <span className='flex items-center gap-1'>
                        <Utensils className='w-4 h-4' />
                        Serves {recipe.servings}
                    </span>
                </div>

                <div className='flex gap-2'>
                    <button
                        onClick={() => onView(recipe)}
                        className='flex-1 px-4 py-2 bg-rose-deep text-card rounded-lg hover:opacity-90 transition'
                    >
                        View
                    </button>
                    <button
                        onClick={() => onShare(recipe)}
                        className='px-4 py-2 bg-blush text-burgundy rounded-lg hover:opacity-80 transition'
                        aria-label='Share recipe'
                    >
                        <Share2 className='w-5 h-5' />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeCard;