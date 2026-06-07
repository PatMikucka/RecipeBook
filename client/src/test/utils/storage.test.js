import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAllRecipes, saveRecipe, deleteRecipe, getRecipe } from '../../utils/storage';
import { request } from '../../utils/api';

vi.mock('../../utils/api.js', () => ({
    request: vi.fn()
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe('loadAllRecipes', () => {
    it('should return the array of recipes from the API', async () => {
        const mockRecipes = [
            { id: '1', title: 'Pasta', time: 30, servings: 4 },
            { id: '2', title: 'Salad', time: 10, servings: 2 }
        ];
        request.mockResolvedValue(mockRecipes);

        const result = await loadAllRecipes();

        expect(request).toHaveBeenCalledWith('/recipes');
        expect(result).toEqual(mockRecipes);
    });

    it('should return an empty array when the API throws', async () => {
        request.mockRejectedValue(new Error('Network error'));

        const result = await loadAllRecipes();

        expect(result).toEqual([]);
    });
});

describe('saveRecipe', () => {
    it('should POST to /recipes foor a new recipe and return the API response', async () => {
        const newRecipe = {
            title: 'Carbonara',
            time: 30,
            servings: 4,
            ingredients: ['pasta', 'eggs'],
            instructions: 'Cook pasta...'
        };

        const serverResponse = { id: 'abc123', ...newRecipe };
        request.mockResolvedValue(serverResponse);

        const result = await saveRecipe(newRecipe);

        expect(request).toHaveBeenCalledWith('/recipes', {
            method: 'POST',
            body: JSON.stringify(newRecipe)
        });

        expect(result).toEqual(serverResponse);
        expect(result.id).toBe('abc123');
    });

    it('should PUT to /recipes/:id for an existing recipe and return the API response', async () => {
        const existingRecipe = {
            id: '12345',
            title: 'Spaghetti Bolognese',
            time: 45,
            servings: 5,
            ingredients: ['pasta', 'beef'],
            instructions: 'Cook the meat...'
        };

        request.mockResolvedValue(existingRecipe);

        const result = await saveRecipe(existingRecipe);

        expect(request).toHaveBeenCalledWith('/recipes/12345', {
            method: 'PUT',
            body: JSON.stringify(existingRecipe)
        });

        expect(result).toEqual(existingRecipe);
    });

    it('should re-throw when the API fails', async () => {
        const recipe = { title: 'fail', time: 5, servings: 1, ingredients: [], instructions: '...' };

        request.mockRejectedValue(new Error('Server error'));

        await expect(saveRecipe(recipe)).rejects.toThrow('Server error');

        expect(request).toHaveBeenCalledTimes(1);
    });

    describe('input validation', () => {
        it('should throw without calling the API when recipe is null', async () => {
            await expect(saveRecipe(null)).rejects.toThrow('Invalid recipe: must be an object.');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when recipe is undefined', async () => {
            await expect(saveRecipe(undefined)).rejects.toThrow('Invalid recipe: must be an object.');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when recipe is a string', async () => {
            await expect(saveRecipe('not an object')).rejects.toThrow('Invalid recipe: must be an object.');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when recipe is a number', async () => {
            await expect(saveRecipe(123)).rejects.toThrow('Invalid recipe: must be an object.');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when recipe is an array', async () => {
            await expect(saveRecipe([])).rejects.toThrow('Invalid recipe: must be an object.');

            expect(request).not.toHaveBeenCalled();
        });
    });
});

describe('deleteRecipe', () => {
    it('should call DELETE /recipes/:id with the correct endpoint', async () => {
        request.mockResolvedValue(undefined);

        await deleteRecipe('12345');

        expect(request).toHaveBeenCalledWith('/recipes/12345', { method: 'DELETE'});

        expect(request).toHaveBeenCalledTimes(1);
    });

    it('should re-throw when the API fails', async () => {
        request.mockRejectedValue(new Error('Failed to delete from storage'));

        await expect(deleteRecipe('12345')).rejects.toThrow('Failed to delete from storage');

        expect(request).toHaveBeenCalledTimes(1);
    });

    describe('input validation', () => {
        it('should throw without calling the API when id is null', async () => {
            await expect(deleteRecipe(null)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when id is undefined', async () => {
            await expect(deleteRecipe(undefined)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when id is a number', async () => {
            await expect(deleteRecipe(123)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when id is an object', async () => {
            await expect(deleteRecipe({})).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });
    });
});

describe('getRecipe', () => {
    it('should return the recipe from the API when it exists', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Tiramisu',
            time: 60,
            servings: 8,
            ingredients: ['mascarpone', 'coffee', 'ladyfingers'],
            instructions: 'Layer and chill'
        };
        request.mockResolvedValue(mockRecipe);

        const result = await getRecipe('12345');

        expect(request).toHaveBeenCalledWith('/recipes/12345');

        expect(result).toEqual(mockRecipe);
    });

    it('should return null when the API throws', async () => {
        request.mockRejectedValue(new Error('Not found'));

        const result = await getRecipe('99999');

        expect(result).toBeNull();

        expect(request).toHaveBeenCalledTimes(1);
    });

    describe('input validation', () => {
        it('should throw without calling the API when id is null', async () => {
            await expect(getRecipe(null)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when id is undefined', async () => {
            await expect(getRecipe(undefined)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without calling the API when id is a number', async () => {
            await expect(getRecipe(123)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });

        it('should throw without clling the API when id is an object', async () => {
            await expect(getRecipe([])).rejects.toThrow('Invalid recipe ID: must be a non-empty string');

            expect(request).not.toHaveBeenCalled();
        });
    });
});