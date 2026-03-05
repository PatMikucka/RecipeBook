// import { describe, it, expect,vi } from 'vitest';
// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import RecipeForm from '../../components/RecipeForm';
// import { useState } from 'react';

// // const [isViewing, setIsViewing] = useState(!!recipe?.id);

// describe('RecipeForm', () => {
//     it('should render an empty form when creating a new recipe', () => {
//         const mockOnSave = vi.fn();
//         const mockOnCancel = vi.fn();

//         render(
//             <RecipeForm
//                 recipe={{}}
//                 onSave={mockOnSave}
//                 onCancel={mockOnCancel}
//             />
//         );
//         const titleInput = screen.getByLabelText('Recipe Title');
//         expect(titleInput).toHaveValue('');

//         const timeInput = screen.getByLabelText(/text/i);
//         expect(timeInput).toHaveValue(30);

//         const servingsInput = screen.getByLabelText(/servings/i);
//         expect(servingsInput).toHaveValue(4);

//     })
// })