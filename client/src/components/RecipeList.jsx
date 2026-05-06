import React from 'react';
import { ChefHat } from 'lucide-react';
import RecipeCard from './RecipeCard';

const RecipeList = ({ recipes, onViewRecipe, onShareRecipe }) => {
    if (recipes.length === 0) {
        return (
            <div className='col-span-full text-center py-16'>
                <ChefHat className='w-20 h-20 mx-auto mb-4 text-rose opacity-30' />
                <p className='text-xl text-burgundy'>No recipes yet. Start by adding the first one!</p>
            </div>
        );
    }
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {recipes.map((recipe) => (
                <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onView={onViewRecipe}
                    onShare={onShareRecipe}
                />
            ))}
        </div>
    );
};

export default RecipeList;