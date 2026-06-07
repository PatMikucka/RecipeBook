import { request } from './api.js';

export const loadAllRecipes = async () => {
    try {
        const recipes = await request('/recipes');
        return recipes;
    } catch (error) {
        console.error('Error loading recipes:', error);
        return [];
    }
};

export const saveRecipe = async (recipe) => {
    try {
        if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
            throw new Error('Invalid recipe: must be an object.');
        }

        if (recipe.id) {
            const updated = await request(`/recipes/${recipe.id}`, {
                method: 'PUT',
                body: JSON.stringify(recipe)
            });
            return updated;
        } else {
            const created = await request('/recipes', {
                method: 'POST',
                body: JSON.stringify(recipe)
            });
            return created;
        }
    } catch (error) {
        console.error('Failed to save recipe:', error);
        throw error;
    }
};

export const deleteRecipe = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid recipe ID: must be a non-empty string');
        }

        await request(`/recipes/${id}`, {
            method: 'DELETE'
        });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        throw error;
    }
};

export const getRecipe = async (id) => {
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid recipe ID: must be a non-empty string');
    }

    try {
        const recipe = await request(`/recipes/${id}`);
        return recipe;
    } catch (error) {
        console.error('Error getting recipe:', error);
        return null;
    }
};
