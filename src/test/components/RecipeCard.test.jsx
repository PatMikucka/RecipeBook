import { describe, it, expect, vi } from "vitest";
import{ render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import RecipeCard from "../../components/RecipeCard";

describe('RecipeCard', () => {
    it('should render recipe information with mood', () => {
        const mockRecipe = {
            id: '1',
            title: 'Carbonara',
            time: 30,
            servings: 4,
            mood: 'Comfort Food'
        };

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeCard recipe={mockRecipe} onView={mockOnView} onShare={mockOnShare} />);

        expect(screen.getByText('Carbonara')).toBeInTheDocument();
        expect(screen.getByText(/30 min/)).toBeInTheDocument();
        expect(screen.getByText(/Serves 4/)).toBeInTheDocument();
        expect(screen.getByText('Comfort Food')).toBeInTheDocument();
    });

    it('should render recipe without mood badge when mood is not provided', () => {
        const mockRecipe = {
            id: '2',
            title: 'Salad',
            time: 10,
            servings: 2
        };

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeCard recipe={mockRecipe} onView={mockOnView} onShare={mockOnShare} />);

        expect(screen.getByText('Salad')).toBeInTheDocument();
        expect(screen.getByText(/10 min/)).toBeInTheDocument();
        expect(screen.getByText(/Serves 2/)).toBeInTheDocument();
    });

    it('should call onView with recipe when View button is clicked', async () => {
        const mockRecipe = {
            id: '1',
            title: 'Carbonara',
            time: 30,
            servings: 4,
            mood: 'Comfort Food'
        };

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeCard recipe={mockRecipe} onView={mockOnView} onShare={mockOnShare} />);

        const viewButton = screen.getByRole('button', { name: /view/i });;
        await userEvent.click(viewButton);

        expect(mockOnView).toHaveBeenCalledTimes(1);
        expect(mockOnView).toHaveBeenCalledWith(mockRecipe);
        expect(mockOnShare).not.toHaveBeenCalled();
    });

    it('should call onShare with revipe when Share button is clicked', async () => {
        const mockRecipe = {
            id: '2',
            title: 'Mango Salad',
            time: 15,
            servings: 2
        };

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeCard recipe={mockRecipe} onView={mockOnView} onShare={mockOnShare} />);

        const shareButton = screen.getByRole('button', { name: /share/i });
        await userEvent.click(shareButton);

        expect(mockOnShare).toHaveBeenCalledTimes(1);
        expect(mockOnShare).toHaveBeenCalledWith(mockRecipe);
        expect(mockOnView).not.toHaveBeenCalled();
    });
});