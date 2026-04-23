export const loadAllRecipes = async () => {
    try {
        const result = await window.storage.list('recipe:');
        if (result?.keys) {
            const recipes = await Promise.all(
                result.keys.map(async (key) => {
                    const data = await window.storage.get(key);
                    return data ? JSON.parse(data.value) : null;
                })
            );
            return recipes.filter(Boolean);
        }
        return [];
    }   catch (error) {
        console.log('Error loading recipes:', error);
        return [];
    }
};


export const saveRecipe = async (recipe) => {
    //Generate ID if creating new recipe
    try {
        if (!recipe || typeof recipe !== 'object' || Array.isArray(recipe)) {
            throw new Error('Invalid recipe: must be an object');
        }

        const recipeWithId = recipe.id
            ? recipe
            : { ...recipe, id: Date.now().toString() };

        await window.storage.set(
            `recipe:${recipeWithId.id}`,
            JSON.stringify(recipeWithId)
        );

        return recipeWithId;
    } catch (error) {
        console.error('Faild to save recipe:', error);
        throw error;
    }
};

export const deleteRecipe = async (id) => {
    try {
        if (!id || typeof id !== 'string') {
            throw new Error('Invalid recipe ID: must be a non-empty string');
        }

        await window.storage.delete(`recipe:${id}`);
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
        const data = await window.storage.get(`recipe:${id}`);
        return data ? JSON.parse(data.value) : null;
    } catch (error) {
        console.log('Error getting recipe:', error);
        return null;
    }
};

