import React from 'react';
import { Clock, Utensils, Share2 } from 'lucide-react';

const RecipeCard = ({ recipe, onView, onShare }) => {
    return (
        <div className='bg-white rounded-lg shadow-mb border-2 border-amber-200 overflow-hidden hover:shadow-xl transition-shadow'>
            <div className='bg-gradient-to-r from-amber-100 to-amber-100 to-amber-50 p-4 border-b-2 border-amber-200'>

                <h3 className='text-xl font-serif font-bold text-amber-900'>{recipe.title}</h3>
                {recipe.mood && (
                    <span className='inline-block mt-2 px-3 py-1 bg-amber-200 text-amber-800 rounded-full text-sm'>
                        {recipe.mood}
                    </span>
                )}
            </div>
            
            <div className='p-4'>
                <div className='flex gap-4 text-sm text-amber-700 mb-3'>
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
                        className='flex-1 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 transition'
                        >
                            View
                        </button>

                        <button
                            onClick={() => onShare(recipe)}
                            className='px-4 py-2 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition'
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