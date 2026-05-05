import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAllRecipes, saveRecipe, deleteRecipe, getRecipe } from '../../utils/storage';

const mockStorage = {
    list: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
};

beforeEach(() => {
    vi.clearAllMocks();
    global.window = { storage: mockStorage };
});

describe('loadAllRecipes', () => {
    it('should load all recipes from storage', async () => {
        const mockRecipes = [
            { id: '1', title: 'Pasta', time: 30, servings: 4 },
            { id: '2', title: 'Salad', time: 15, servings: 2 }
        ];

        mockStorage.list.mockResolvedValue({
            keys: ['recipe:1', 'recipe:2']
        });

        mockStorage.get
            .mockResolvedValueOnce({ value: JSON.stringify(mockRecipes[0]) })
            .mockResolvedValueOnce({ value: JSON.stringify(mockRecipes[1]) });

        const result = await loadAllRecipes();

        expect(result).toEqual(mockRecipes);
        expect(mockStorage.list).toHaveBeenCalledWith('recipe:');
        expect(mockStorage.get).toHaveBeenCalledTimes(2);
    });

    it('should return empty array when no recibes exist', async () => {
        mockStorage.list.mockResolvedValue({ keys: null });

        const result = await loadAllRecipes();

        expect(result).toEqual([]);
    });

    it('should filter out null values', async () => {
        mockStorage.list.mockResolvedValue({
            keys: ['recipe:1', 'recipe:2']
        });

        mockStorage.get
            .mockResolvedValueOnce({ value: JSON.stringify({ id: '1', title: 'Pasta' }) })
            .mockResolvedValueOnce(null);

        const result = await loadAllRecipes();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('1');
    });
});

describe('saveRecipe', () => {
    it('should save a new recipe and generate an ID', async () => {
        const newRecipe = {
            title: 'Carbonara',
            time: 30,
            servings: 4,
            ingredients: ['pasta', 'eggs'],
            instructions: 'Cook pasta...'
        };

        mockStorage.set.mockResolvedValue(null);

        const result = await saveRecipe(newRecipe);

        expect(result).toHaveProperty('id');
        expect(result.id).toBeTruthy();
        expect(typeof result.id).toBe('string');

        expect(result.title).toBe('Carbonara');
        expect(result.time).toBe(30);
        expect(result.servings).toBe(4);
        expect(result.ingredients).toEqual(['pasta', 'eggs']);
        expect(result.instructions).toBe('Cook pasta...');

        expect(mockStorage.set).toHaveBeenCalledTimes(1);

        expect(mockStorage.set).toHaveBeenCalledWith(
            `recipe:${result.id}`,
            JSON.stringify(result)
        );
    });

    it('should save an existing recipe and preserve its ID', async () => {
        const existingRecipe = {
            id: '12345',
            title: 'Spagetti Bolognese',
            time: 45,
            servings: 5,
            ingredients: ['spagetti', 'beef', 'tomatoes'],
            instructions: 'Cook the meat...'
        };

        mockStorage.set.mockResolvedValue(null);

        const result = await saveRecipe(existingRecipe);

        expect(result.id).toBe('12345');
        expect(result.title).toBe('Spagetti Bolognese');
        expect(result.time).toBe(45);
        expect(result.servings).toBe(5);
        expect(result.ingredients).toEqual(['spagetti', 'beef', 'tomatoes']);
        expect(result.instructions).toBe('Cook the meat...')

        expect(mockStorage.set).toHaveBeenCalledTimes(1);

        expect(mockStorage.set).toHaveBeenCalledWith(
            'recipe:12345',
            JSON.stringify(existingRecipe)
        );
    });

    it('should throw an error when storage.set fails', async () => {
        const newRecipe = {
            title: 'Failure',
            time: 5,
            servings: 1,
            ingredients: ['mistake'],
            instructions: 'Instructions here'
        };

        const storageError = new Error('Storage quota exceeded');
        mockStorage.set.mockRejectedValue(storageError);

        await expect(saveRecipe(newRecipe)).rejects.toThrow('Storage quota exceeded');

        expect(mockStorage.set).toHaveBeenCalledTimes(1);
    });

    describe('Edge Save Cases', () => {
        it('should throw am error when recipe is null', async () => {
            await expect(saveRecipe(null)).rejects.toThrow('Invalid recipe: must be an object');
        });

        it('should throw an error when recipe is undefined', async () => {
            await expect(saveRecipe(undefined)).rejects.toThrow('Invalid recipe: must be an object');
        });

        it('should throw an error when recipe is not an object', async () => {
            await expect(saveRecipe('not an object')).rejects.toThrow('Invalid recipe: must be an object');
            await expect(saveRecipe(123)).rejects.toThrow('Invalid recipe: must be an object');
            await expect(saveRecipe([])).rejects.toThrow('Invalid recipe: must be an object');
        });
    });
});

describe('deleteRecipe', () => {
    it('should delete a recipe with the correct key', async () => {
        const recipeId = '12345';
        mockStorage.delete.mockResolvedValue(null);

        await deleteRecipe(recipeId);

        expect(mockStorage.delete).toHaveBeenCalledTimes(1);
        expect(mockStorage.delete).toHaveBeenCalledWith('recipe:12345');
    });

    it('should throw an error when storage.delete fails', async () => {
        const recipeId = '12345';
        const storageError = new Error('Failed to delete from storage');

        mockStorage.delete.mockRejectedValue(storageError);

        await expect(deleteRecipe(recipeId)).rejects.toThrow('Failed to delete from storage');

        expect(mockStorage.delete).toHaveBeenCalledTimes(1);
    });

    describe('Edge Delete Cases', () => {
        it('should throw an error when id is null', async () => {
            await expect(deleteRecipe(null)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });

        it('should throw an error when id is undefined', async () => {
            await expect(deleteRecipe(undefined)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });

        it('should throw an error when id is not a string', async () => {
            await expect(deleteRecipe(123)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
            await expect(deleteRecipe({})).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
            await expect(deleteRecipe([])).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });
    });
});

describe('getRecipe', () => {
    it('should return a recipe when it exists', async () => {
        const mockRecipe = {
            id: '12345',
            title: 'Tiramisu',
            time: 60,
            servings: 8,
            ingredients: ['mascarpone', 'coffee', 'ladyfingers'],
            instructions: 'Layer and chill'
        };

        mockStorage.get.mockResolvedValue({
            value: JSON.stringify(mockRecipe)
        });

        const result = await getRecipe('12345');

        expect(result).toEqual(mockRecipe);
        expect(mockStorage.get).toHaveBeenCalledTimes(1);
        expect(mockStorage.get).toHaveBeenCalledWith('recipe:12345');
    });

    it('should return null when recipe does not exist', async () => {
        mockStorage.get.mockResolvedValue(null);

        const result = await getRecipe('99999');

        expect(result).toBeNull();
        expect(mockStorage.get).toHaveBeenCalledTimes(1);
        expect(mockStorage.get).toHaveBeenCalledWith('recipe:99999');
    });

    it('should return null when storage.get fails', async () => {
        const storageError = new Error('Storage access denied');
        mockStorage.get.mockRejectedValue(storageError);

        const result = await getRecipe('12345');

        expect(result).toBeNull();
        expect(mockStorage.get).toHaveBeenCalledTimes(1);
    });

    describe('Edge Cases', () => {
        it('should throw an errir when id is null', async () => {
            await expect(getRecipe(null)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });

        it('should throw an error when id is undefined', async () => {
            await expect(getRecipe(undefined)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });

        it('should throw an error when id is not a string', async () => {
            await expect(getRecipe(123)).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
            await expect(getRecipe({})).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
            await expect(getRecipe([])).rejects.toThrow('Invalid recipe ID: must be a non-empty string');
        });
    });
});