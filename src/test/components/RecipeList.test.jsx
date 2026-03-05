import { describe,it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RecipeList from "../../components/RecipeList";
import userEvent from "@testing-library/user-event";

describe('RecipeList', () => {
    it('should display empty state when there are no recipes', () => {
        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeList recipes={[]} onViewRecipe={mockOnView} onShareRecipe={mockOnShare} />);

        expect(screen.getByText(/no recipes yet/i)).toBeInTheDocument();
        expect(screen.getByText(/start by adding the first one/i)).toBeInTheDocument();
    });

    it('should render a RecipeCard for each recipe', () => {
        const mockRecipes = [
            { id: '1', title: 'Carbonara', time: 30, servings: 4 },
            { id: '2', title: 'Mango Salad', time: 15, servings: 2 },
            { id: '3', title: 'Tiramisu', time: 60, servings: 8 }
        ];

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeList recipes={mockRecipes} onViewRecipe={mockOnView} onShareRecipe={mockOnShare} />);

        expect(screen.getByText('Carbonara')).toBeInTheDocument();
        expect(screen.getByText('Mango Salad')).toBeInTheDocument();
        expect(screen.getByText('Tiramisu')).toBeInTheDocument();
    });

    it('should not display empty state when recipes exist', () => {
        const mockRecipes = [
            { id: '1', title: 'Carbonara', time: 30, servings: 4 }
        ];

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeList recipes={mockRecipes} onViewRecipe={mockOnView} onShareRecipe={mockOnShare} />);

        expect(screen.queryByText(/no recipes yet/i)).not.toBeInTheDocument();
    });

    it('should pass correct props to RecipeCard components', async () => {
        const mockRecipes = [
            { id: '1', title: 'Carbonara', time: 30, servings: 4 }
        ];

        const mockOnView = vi.fn();
        const mockOnShare = vi.fn();

        render(<RecipeList recipes={mockRecipes} onViewRecipe={mockOnView} onShareRecipe={mockOnShare} />);

        const viewButton = screen.getByRole('button', { name: /view/i });
        await userEvent.click(viewButton);

        expect(mockOnView).toHaveBeenCalledWith(mockRecipes[0]);
    });
});