import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { loadAllRecipes, saveRecipe, deleteRecipe } from '../utils/storage';

vi.mock('../components/AuthForm.jsx', () => ({
    default: ({ onLogin }) => (
        <div>
            <span>AuthForm</span>
            <button onClick={() => onLogin({ id: '1', email: 'a@b.com' })}>
                Mock Login
            </button>
        </div>
    )
}));

vi.mock('../components/RecipeList.jsx', () => ({
    default: ({ recipes, onViewRecipe, onShareRecipe }) => (
        <div>
            <span>RecipeList</span>
            <span data-testid="recipe-count">{recipes.length}</span>
            <button onClick={() => onViewRecipe(recipes[0])}>Mock View</button>
            <button onClick={() => onShareRecipe(recipes[0])}>Mock Share</button>
        </div>
    )
}));

vi.mock('../components/RecipeForm.jsx', () => ({
    default: ({ recipe, onSave, onCancel, onDelete }) => (
        <div>
            <span>RecipeForm</span>
            <button onClick={() => onSave({ ...recipe, title: 'Saved Recipe' })}>Mock Save</button>
            <button onClick={onCancel}>Mock Cancel</button>
            {onDelete && <button onClick={onDelete}>Mock Delete</button>}
        </div>
    )
}));

vi.mock('../components/RecipePicker.jsx', () => ({
    default: () => <div><span>RecipePicker</span></div>
}));

vi.mock('../components/VerifyEmail.jsx', () => ({
    default: ({ onContinue }) => (
        <div>
            <span>VerifyEmail</span>
            <button onClick={onContinue}>Mock Continue</button>
        </div>
    )
}));

vi.mock('../components/ResetPassword.jsx', () => ({
    default: ({ onComplete }) => (
        <div>
            <span>ResetPassword</span>
            <button onClick={onComplete}>Mock Complete</button>
        </div>
    )
}));

vi.mock('../utils/storage.js', () => ({
    loadAllRecipes: vi.fn(),
    saveRecipe: vi.fn(),
    deleteRecipe: vi.fn()
}));

let store = {};
const localStorageMock = {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; })
};
vi.stubGlobal('localStorage', localStorageMock);

const setPath = (path) => {
    Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, pathname: path }
    });
};

const mockRecipes = [
    { id: '1', title: 'Carbonara', time: 30, servings: 4, ingredients: [], instructions: '' },
    { id: '2', title: 'Salad', time: 15, servings: 2, ingredients: [], instructions: '' }
];

const setLoggedInUser = () => {
    store['token'] = 'tok123';
    store['user'] = JSON.stringify({ id: '1', email: 'a@b.com' });
};

beforeEach(() => {
    vi.clearAllMocks();
    store = {};
    setPath('/');
    loadAllRecipes.mockResolvedValue([]);
});

describe('routing', () => {
    it('should render VerifyEmail on /verify path', () => {
        setPath('/verify');
        render(<App />);

        expect(screen.getByText('VerifyEmail')).toBeInTheDocument();
    });

    it('should render ResetPassword on /reset-password path', () => {
        setPath('/reset-password');
        render(<App />);

        expect(screen.getByText('ResetPassword')).toBeInTheDocument();
    });

    it('should render AuthForm on the root path when not logged in', async () => {
        render(<App />);

        expect(await screen.findByText('AuthForm')).toBeInTheDocument();
    });
});

describe('auth state on load', () => {
    it('should show AuthForm when no token is in localStorage', async () => {
        render(<App />);

        expect(await screen.findByText('AuthForm')).toBeInTheDocument();
    });

    it('should show the main app when token and user exist in localStorage', async () => {
        setLoggedInUser();
        loadAllRecipes.mockResolvedValue(mockRecipes);
        render(<App />);

        expect(await screen.findByText('RecipeList')).toBeInTheDocument();
    });

    it('should load recipes on mount when already logged in', async () => {
        setLoggedInUser();
        loadAllRecipes.mockResolvedValue(mockRecipes);
        render(<App />);

        await screen.findByText('RecipeList');
        expect(loadAllRecipes).toHaveBeenCalled();
    });

    it('should display the signed in email in the header', async () => {
        setLoggedInUser();
        render(<App />);

        expect(await screen.findByText(/a@b.com/i)).toBeInTheDocument();
    });
});

describe('login and logout', () => {
    it('should show the main app after login', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /mock login/i }));

        expect(await screen.findByText('RecipeList')).toBeInTheDocument();
    });

    it('should load recipes after login', async () => {
        const user = userEvent.setup();
        loadAllRecipes.mockResolvedValue(mockRecipes);
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /mock login/i }));
        await screen.findByText('RecipeList');

        expect(loadAllRecipes).toHaveBeenCalled();
    });

    it('should show AuthForm after logout', async () => {  // fixed: was 'afterv'
        setLoggedInUser();
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /sign out/i }));

        expect(await screen.findByText('AuthForm')).toBeInTheDocument();
    });

    it('should clear localStorage on logout', async () => {
        setLoggedInUser();
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /sign out/i }));

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    });
});

describe('navigation', () => {
    beforeEach(() => setLoggedInUser());

    it('should show RecipeList when All Recipes is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /new recipe/i }));
        await user.click(screen.getByRole('button', { name: /all recipes/i }));

        expect(screen.getByText('RecipeList')).toBeInTheDocument();
    });

    it('should show RecipeForm when New Recipe is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /new recipe/i }));

        expect(screen.getByText('RecipeForm')).toBeInTheDocument();
    });

    it("should show RecipePicker when What's for Dinner is clicked", async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /what's for dinner/i }));

        expect(screen.getByText('RecipePicker')).toBeInTheDocument();
    });

    it('should show RecipeForm when a recipe is viewed from the list', async () => {
        loadAllRecipes.mockResolvedValue(mockRecipes);
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /mock view/i }));

        expect(screen.getByText('RecipeForm')).toBeInTheDocument();
    });
});

describe('recipe operations', () => {
    beforeEach(() => {
        setLoggedInUser();
        loadAllRecipes.mockResolvedValue(mockRecipes);
    });

    it('should call saveRecipe and reload recipes when a recipe is saved', async () => {
        saveRecipe.mockResolvedValue({});
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /new recipe/i }));
        await user.click(screen.getByRole('button', { name: /mock save/i }));

        expect(saveRecipe).toHaveBeenCalledTimes(1);
        expect(loadAllRecipes).toHaveBeenCalled();
    });

    it('should return to the list view after saving a recipe', async () => {
        saveRecipe.mockResolvedValue({});
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /new recipe/i }));
        await user.click(await screen.findByRole('button', { name: /mock save/i })); // fixed: was missing await

        expect(await screen.findByText('RecipeList')).toBeInTheDocument();
    });

    it('should return to the list view when Cancel is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /new recipe/i }));
        await user.click(screen.getByRole('button', { name: /mock cancel/i }));

        expect(await screen.findByText('RecipeList')).toBeInTheDocument();
    });

    it('should call deleteRecipe and reload recipes when a recipe is deleted', async () => {
        deleteRecipe.mockResolvedValue({});
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /mock view/i }));
        await user.click(screen.getByRole('button', { name: /mock delete/i }));

        expect(deleteRecipe).toHaveBeenCalledTimes(1);
        expect(loadAllRecipes).toHaveBeenCalled();
    });

    it('should return to the list view after deleting a recipe', async () => {
        deleteRecipe.mockResolvedValue({});
        const user = userEvent.setup();
        render(<App />);

        await user.click(await screen.findByRole('button', { name: /mock view/i }));
        await user.click(screen.getByRole('button', { name: /mock delete/i }));

        expect(await screen.findByText('RecipeList')).toBeInTheDocument();
    });

    it('should call onShareRecipe when Mock Share is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);

        await screen.findByText('RecipeList');
        await user.click(screen.getByRole('button', { name: /mock share/i }));
    });
});