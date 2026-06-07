import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipePicker from '../../components/RecipePicker';

// Default props reused across most tests. Individual tests override what they need.
const defaultFilters = {
    maxTime: 60,
    mood: '',
    availableIngredients: [],
    missingIngredients: []
};

const mockRecipe = {
    id: '1',
    title: 'Carbonara',
    time: 30,
    servings: 4,
    mood: 'Comfort Food',
    ingredients: ['200g pasta', '2 eggs', '100g pancetta']
};

// userEvent.setup() is required in v14 — calling userEvent.type() directly
// doesn't work because it can't resolve the window from the rendered node.
const renderPicker = (overrides = {}) => {
    const user = userEvent.setup();
    const props = {
        recipes: [mockRecipe],
        filters: defaultFilters,
        setFilters: vi.fn(),
        onPick: vi.fn(),
        onViewRecipe: vi.fn(),
        ...overrides
    };
    render(<RecipePicker {...props} />);
    return { ...props, user };
};

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('rendering', () => {
    it('should render the heading and pick button', () => {
        renderPicker();

        expect(screen.getByText('What Should I Make?')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /pick a recipe for me/i })).toBeInTheDocument();
    });

    it('should display the current maxTime from filters', () => {
        renderPicker({ filters: { ...defaultFilters, maxTime: 45 } });

        expect(screen.getByText(/maximum time.*45/i)).toBeInTheDocument();
    });

    it('should render all mood buttons including Any Mood', () => {
        renderPicker();

        expect(screen.getByRole('button', { name: 'Any Mood' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Comfort Food' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Healthy' })).toBeInTheDocument();
    });

    it('should not show the modal on initial render', () => {
        renderPicker();

        expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Available ingredients
// ---------------------------------------------------------------------------

describe('available ingredients', () => {
    it('should call setFilters with new ingredient when Add button is clicked', async () => {
        const { setFilters, user } = renderPicker();

        await user.type(screen.getByPlaceholderText(/chicken, tomatoes/i), 'chicken');
        await user.click(screen.getAllByRole('button', { name: /add/i })[0]);

        expect(setFilters).toHaveBeenCalledWith({
            ...defaultFilters,
            availableIngredients: ['chicken']
        });
    });

    it('should call setFilters when Enter is pressed in the available input', async () => {
        const { setFilters, user } = renderPicker();

        await user.type(screen.getByPlaceholderText(/chicken, tomatoes/i), 'tomatoes{Enter}');

        expect(setFilters).toHaveBeenCalledWith({
            ...defaultFilters,
            availableIngredients: ['tomatoes']
        });
    });

    it('should not call setFilters when the available input is empty or whitespace', async () => {
        const { setFilters, user } = renderPicker();

        await user.click(screen.getAllByRole('button', { name: /add/i })[0]);

        expect(setFilters).not.toHaveBeenCalled();
    });

    it('should display existing available ingredient tags', () => {
        renderPicker({
            filters: { ...defaultFilters, availableIngredients: ['chicken'] }
        });

        expect(screen.getByText('chicken')).toBeInTheDocument();
    });

    it('should call setFilters to remove an available ingredient when its × is clicked', async () => {
        const filters = { ...defaultFilters, availableIngredients: ['chicken', 'tomatoes'] };
        const { setFilters, user } = renderPicker({ filters });

        const removeButtons = screen.getAllByRole('button', { name: '' });
        await user.click(removeButtons[0]);

        expect(setFilters).toHaveBeenCalledWith({
            ...filters,
            availableIngredients: ['tomatoes']
        });
    });
});

// ---------------------------------------------------------------------------
// Missing ingredients
// ---------------------------------------------------------------------------

describe('missing ingredients', () => {
    it('should call setFilters with new ingredient when Add button is clicked', async () => {
        const { setFilters, user } = renderPicker();

        await user.type(screen.getByPlaceholderText(/cream, parmesan/i), 'cream');
        await user.click(screen.getAllByRole('button', { name: /add/i })[1]);

        expect(setFilters).toHaveBeenCalledWith({
            ...defaultFilters,
            missingIngredients: ['cream']
        });
    });

    it('should call setFilters when Enter is pressed in the missing input', async () => {
        const { setFilters, user } = renderPicker();

        await user.type(screen.getByPlaceholderText(/cream, parmesan/i), 'parmesan{Enter}');

        expect(setFilters).toHaveBeenCalledWith({
            ...defaultFilters,
            missingIngredients: ['parmesan']
        });
    });

    it('should not call setFilters when the missing input is empty or whitespace', async () => {
        const { setFilters, user } = renderPicker();

        await user.click(screen.getAllByRole('button', { name: /add/i })[1]);

        expect(setFilters).not.toHaveBeenCalled();
    });

    it('should display existing missing ingredient tags', () => {
        renderPicker({
            filters: { ...defaultFilters, missingIngredients: ['cream'] }
        });

        expect(screen.getByText('cream')).toBeInTheDocument();
    });

    it('should call setFilters to remove a missing ingredient when its × is clicked', async () => {
        const filters = { ...defaultFilters, missingIngredients: ['cream', 'parmesan'] };
        const { setFilters, user } = renderPicker({ filters });

        const removeButtons = screen.getAllByRole('button', { name: '' });
        await user.click(removeButtons[0]);

        expect(setFilters).toHaveBeenCalledWith({
            ...filters,
            missingIngredients: ['parmesan']
        });
    });
});

// ---------------------------------------------------------------------------
// Mood filter
// ---------------------------------------------------------------------------

describe('mood filter', () => {
    it('should call setFilters with the selected mood when a mood button is clicked', async () => {
        const { setFilters, user } = renderPicker();

        await user.click(screen.getByRole('button', { name: 'Comfort Food' }));

        expect(setFilters).toHaveBeenCalledWith({
            ...defaultFilters,
            mood: 'Comfort Food'
        });
    });

    it('should call setFilters with empty mood when Any Mood is clicked', async () => {
        const { setFilters, user } = renderPicker({ filters: { ...defaultFilters, mood: 'Healthy' } });

        await user.click(screen.getByRole('button', { name: 'Any Mood' }));

        expect(setFilters).toHaveBeenCalledWith(expect.objectContaining({ mood: '' }));
    });
});

// ---------------------------------------------------------------------------
// Pick flow
// ---------------------------------------------------------------------------

describe('pick flow', () => {
    it('should call onPick when the pick button is clicked', async () => {
        const onPick = vi.fn().mockReturnValue(null);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));

        expect(onPick).toHaveBeenCalledTimes(1);
    });

    it('should show the modal with the picked recipe when onPick returns a recipe', async () => {
        const onPick = vi.fn().mockReturnValue(mockRecipe);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));

        expect(screen.getByText('Carbonara')).toBeInTheDocument();
        expect(screen.getByText(/30 minutes/)).toBeInTheDocument();
        expect(screen.getByText(/serves 4/i)).toBeInTheDocument();
        expect(screen.getAllByText(/200g pasta/)[0]).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /view full recipe/i })).toBeInTheDocument();
    });

    it('should not show the modal when onPick returns null', async () => {
        const onPick = vi.fn().mockReturnValue(null);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));

        expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });

    it('should show the recipe mood badge in the modal when mood is set', async () => {
        const onPick = vi.fn().mockReturnValue(mockRecipe);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));

        // "Comfort Food" appears both as a mood filter button and in the modal badge.
        // Scope to the modal by finding the element inside the fixed overlay.
        const modal = document.querySelector('.fixed');
        expect(modal).toBeTruthy();
        expect(modal.textContent).toContain('Comfort Food');
    });

    it('should call onViewRecipe and close the modal when View Full Recipe is clicked', async () => {
        const onPick = vi.fn().mockReturnValue(mockRecipe);
        const onViewRecipe = vi.fn();
        const { user } = renderPicker({ onPick, onViewRecipe });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));
        await user.click(screen.getByRole('button', { name: /view full recipe/i }));

        expect(onViewRecipe).toHaveBeenCalledWith(mockRecipe);
        expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });

    it('should call onPick again when Pick Again is clicked', async () => {
        const onPick = vi.fn().mockReturnValue(mockRecipe);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));
        await user.click(screen.getByRole('button', { name: /pick again/i }));

        expect(onPick).toHaveBeenCalledTimes(2);
    });

    it('should close the modal when the backdrop is clicked', async () => {
        const onPick = vi.fn().mockReturnValue(mockRecipe);
        const { user } = renderPicker({ onPick });

        await user.click(screen.getByRole('button', { name: /pick a recipe for me/i }));
        expect(screen.getByText('View Full Recipe')).toBeInTheDocument();

        const backdrop = document.querySelector('.fixed');
        await user.click(backdrop);

        expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });
});