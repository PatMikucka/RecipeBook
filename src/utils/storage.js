/**
 * Loads all recipes from storage
 * @returns {Promise<Array>} array of recipe objects
 */

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

/**
 * Saves a recipe to storage (creates new or updates existing)
 * @param {Object} recipe to save
 * @returns {Promise<Object>} the saved recipe with ID
 */

export const saveRecipe = async (recipe) => {
    //Generate ID if creating new recipe
    const recipeWithId = recipe.id
    ? recipe
    : { ...recipe, id: Date.now().toString() };

    //Save to storage
    await window.storage.set(
        `recipe:${recipeWithId.id}`,
        JSON.stringify(recipeWithId)
    );

    return recipeWithId;
};

/**
 * Deletes a recipe from storage
 * @param {string} id - recipe ID to delete
 * @returns {Promise<void>}
 */

export const deleteRecipe = async (id) => {
    await window.storage.delete(`recipe:${id}`);
};

/**
 * Gets a single recipe by ID
 * @param {string} id
 * @returns {Promise<Object|null>} recipe object or null if not found
 */

export const getRecipe = async (id) => {
    try {
        const data = await window.storage.get(`recipe:${id}`);
        return data ? JSON.parse(data.value) : null;
    } catch (error) {
        console.log('Error getting recipe:', error);
        return null;
    }
};

