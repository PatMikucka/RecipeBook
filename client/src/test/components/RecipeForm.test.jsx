import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeForm from '../../components/RecipeForm';

const existingRecipe = {
    id: 'abc123',
    title: 'Carbonara',
    time: 30,
    servings: 4,
    mood: 'Comfort Food',
    ingredients: ['400g pasta', '2 eggs', '100g pancetta'],
    instructions: 'Cook pasta. Mix eggs. Combine.'
};

const newRecipe = {
    title: '',
    time: 30,
    servings: 4,
    mood: '',
    ingredients: [''],
    instructions: ''
};

const renderForm = (recipe, overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        recipe,
        onSave: vi.fn(),
        onCancel: vi.fn(),
        onDelete: null,
        ...overrides
    };

    render(<RecipeForm {...props} />);
    return { ...props, user };
};

describe('view mode (existing recipe)', () => {
    it('should display the recipe title and details', () => {
        renderForm(existingRecipe);

        expect(screen.getByDisplayValue('Carbonara')).toBeInTheDocument();
        expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    it('should render all fields as disabled', () => {
        renderForm(existingRecipe);

        expect(screen.getByDisplayValue('Carbonara')).toBeDisabled();
        expect(screen.getByDisplayValue('30')).toBeDisabled();
    });

    it('should show ingredients as static text, not inputs', () => {
        renderForm(existingRecipe);

        expect(screen.getByText('400g pasta')).toBeInTheDocument();
        expect(screen.getByText('2 eggs')).toBeInTheDocument();

        const ingredientInputs = screen.queryAllByPlaceholderText(/200g flour/i);
        expect(ingredientInputs).toHaveLength(0);
    });

    it('should show instructions as static text, not a textarea', () => {
        renderForm(existingRecipe);

        expect(screen.getByText('Cook pasta. Mix eggs. Combine.')).toBeInTheDocument();
        expect(screen.queryByRole('textbox', { name: /instructions/i })).not.toBeInTheDocument();
    });

    it('should show the portion calculator panel', () => {
        renderForm(existingRecipe);

        expect(screen.getByText(/adjust servings/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit recipe/i })).toBeInTheDocument();
    });

    it('should show Back to Recipes button not Save or Cancel', () => {
        renderForm(existingRecipe);

        expect(screen.getByRole('button', { name: /back to recipes/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /save recipe/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /^cancel$/i })).not.toBeInTheDocument();
    });

    it('should call onCancel when Back to Recipes is clicked', async () => {
        const { onCancel, user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: /back to recipes/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});

describe('edit mode (new recipe)', () => {
    it('should show editable fields', () => {
        renderForm(newRecipe);

        // Now that the label has htmlFor="title" we can use getByLabelText
        const titleInput = screen.getByLabelText(/recipe title/i);
        expect(titleInput).toBeInTheDocument();
        expect(titleInput).not.toBeDisabled();
    });

    it('should not show the portion calculator panel', () => {
        renderForm(newRecipe);

        expect(screen.queryByText(/adjust servings/i)).not.toBeInTheDocument();
    });

    it('should show Save Recipe and Cancel buttons', () => {
        renderForm(newRecipe);

        expect(screen.getByRole('button', { name: /save recipe/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should not show Delete button when onDelete is not provided', () => {
        renderForm(newRecipe);

        expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    });

    it('should show Delete button when onDelete prop is provided', () => {
        renderForm(newRecipe, { onDelete: vi.fn() });

        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should show ingredient input fields with Add Ingredient button', () => {
        renderForm(newRecipe);

        expect(screen.getByPlaceholderText(/200g flour/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add ingredient/i })).toBeInTheDocument();
    });

    it('should show a textarea for instructions', () => {
        renderForm(newRecipe);

        // Now that the label has htmlFor="instructions" we can use getByLabelText
        expect(screen.getByLabelText(/instructions/i)).toBeInTheDocument();
    });
});

describe('switching from view to edit mode', () => {
    it('should switch to edit mode when Edit Recipe is clicked', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: /edit recipe/i }));

        expect(screen.getByDisplayValue('Carbonara')).not.toBeDisabled();
        expect(screen.getByRole('button', { name: /save recipe/i })).toBeInTheDocument();
    });

    it('should hide the portion calculator after switching to edit mode', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: /edit recipe/i }));

        expect(screen.queryByText(/adjust servings/i)).not.toBeInTheDocument();
    });

    it('should preserve the recipe data when switching to edit mode', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: /edit recipe/i }));

        expect(screen.getByDisplayValue('Carbonara')).toBeInTheDocument();
    });
});

describe('portion calculator', () => {
    it('should display the original serving count initially', () => {
        renderForm(existingRecipe);

        expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should increase serving count when + is clicked', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: '+' }));

        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should decrease serving count when − is clicked', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: '−' }));

        expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not go below 1 serving when − is clicked', async () => {
        const { user } = renderForm(existingRecipe);

        for (let i = 0; i < 10; i++) {
            await user.click(screen.getByRole('button', { name: '−' }));
        }

        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should show the adjustment hint when servings differ from original', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: '+' }));

        expect(screen.getByText((_, element) =>
            element?.tagName === 'DIV' &&
            element?.textContent?.trim() === 'Ingredients were adjusted from 4 to 5'
        )).toBeInTheDocument();
    });

    it('should not show the adjustment hint when at original serving count', () => {
        renderForm(existingRecipe);

        expect(screen.queryByText(/adjusted from/i)).not.toBeInTheDocument();
    });

    it('should reset to original servings when Reset button is clicked', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: '+' }));
        expect(screen.getByText('5')).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: /reset to original/i }));

        expect(screen.getByText('4')).toBeInTheDocument();
        expect(screen.queryByText(/adjusted from/i)).not.toBeInTheDocument();
    });

    it('should scale ingredients when servings are increased', async () => {
        const { user } = renderForm(existingRecipe);

        for (let i = 0; i < 4; i++) {
            await user.click(screen.getByRole('button', { name: '+' }));
        }

        expect(screen.getByText('800g pasta')).toBeInTheDocument();
    });

    it('should restore original ingredient amounts after reset', async () => {
        const { user } = renderForm(existingRecipe);

        await user.click(screen.getByRole('button', { name: '+' }));
        await user.click(screen.getByRole('button', { name: /reset to original/i }));

        expect(screen.getByText('400g pasta')).toBeInTheDocument();
    });
});

describe('ingredient management in edit mode', () => {
    it('should add a new empty ingredient input when Add Ingredient is clicked', async () => {
        const { user } = renderForm(newRecipe);

        expect(screen.getAllByPlaceholderText(/200g flour/i)).toHaveLength(1);

        await user.click(screen.getByRole('button', { name: /add ingredient/i }));

        expect(screen.getAllByPlaceholderText(/200g flour/i)).toHaveLength(2);
    });

    it('should not show remove buttons when there is only one ingredient', () => {
        renderForm(newRecipe);

        expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
    });

    it('should show remove buttons when there are multiple ingredients', async () => {
        const { user } = renderForm(newRecipe);

        await user.click(screen.getByRole('button', { name: /add ingredient/i }));

        const removeButtons = screen.getAllByRole('button', { name: '' });
        expect(removeButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should remove an ingredient when its X button is clicked', async () => {
        const recipe = { ...newRecipe, ingredients: ['200g pasta', '2 eggs'] };
        const { user } = renderForm(recipe);

        expect(screen.getAllByPlaceholderText(/200g flour/i)).toHaveLength(2);

        const removeButtons = screen.getAllByRole('button', { name: '' });
        await user.click(removeButtons[0]);

        expect(screen.getAllByPlaceholderText(/200g flour/i)).toHaveLength(1);
    });
});

describe('form actions', () => {
    it('should call onSave with the form when Save Recipe is clicked', async () => {
        const { onSave, user } = renderForm(newRecipe);

        await user.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            title: '',
            time: 30,
            servings: 4
        }));
    });

    it('should call onSave with updated title after user types in the title field', async () => {
        const { onSave, user } = renderForm(newRecipe);

        // Now that the label has htmlFor="title" we can use getByLabelText
        await user.type(screen.getByLabelText(/recipe title/i), 'My New Recipe');
        await user.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            title: 'My New Recipe'
        }));
    });

    it('should call onCancel when Cancel is clicked in edit mode', async () => {
        const { onCancel, user } = renderForm(newRecipe);

        await user.click(screen.getByRole('button', { name: /cancel/i }));

        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onDelete when Delete is clicked', async () => {
        const onDelete = vi.fn();
        const { user } = renderForm(newRecipe, { onDelete });

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('should include the recipe id in the saved data for existing recipes', async () => {
        const { onSave, user } = renderForm(existingRecipe, { onDelete: vi.fn() });

        await user.click(screen.getByRole('button', { name: /edit recipe/i }));
        await user.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
            id: 'abc123'
        }));
    });
});

describe('mood selection', () => {
    it('should select a mood when a mood button is clicked', async () => {
        const { onSave, user } = renderForm(newRecipe);

        await user.click(screen.getByRole('button', { name: 'Hearty' }));
        await user.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ mood: 'Hearty' }));
    });

    it('should deselect a mood when the same button is clicked again', async () => {
        const recipe = { ...newRecipe, mood: 'Hearty' };
        const { onSave, user } = renderForm(recipe);

        await user.click(screen.getByRole('button', { name: 'Hearty' }));
        await user.click(screen.getByRole('button', { name: /save recipe/i }));

        expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ mood: '' }));
    });
});