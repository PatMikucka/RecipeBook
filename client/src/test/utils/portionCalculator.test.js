import { describe, it, expect } from "vitest";
import { scaleIngredient, scaleIngredients } from "../../utils/portionCalculator";

describe('scaleIngredient', () => {
    describe('Basic Scaling', () => {
        it('should scale whole numbers correctly when doubling', () => {
            const result = scaleIngredient('2 cups flour',4, 8);
            expect (result).toBe('4 cups flour');
        });

        it('should scale whole numbers correctly when halving', () => {
            const result = scaleIngredient('2 cups flour', 4, 2);
            expect(result).toBe('1 cups flour');
        });

        it('should scale whole numbers correctly when tripling', () => {
            const result = scaleIngredient('1 cup sugar', 2, 6);
            expect(result).toBe('3 cup sugar');
        });

        it('should handle scaling by non-integer ratios', () => {
            const result = scaleIngredient('4 cups flour', 4, 3);
            expect(result).toBe('3 cups flour');
        });
    });

    describe('Decimal Handling', () => {
        it('should scale decimals correctly', () => {
            const result = scaleIngredient('1.5 cups sugar', 4, 8);
            expect(result).toBe('3 cups sugar');
        });

        it('should format decimals without trailing zeros', () => {
            const result = scaleIngredient('2 cups flour', 4, 3);
            expect(result).toBe('1.5 cups flour');
        });

        it('should round decimals to 2 places', () => {
            const result = scaleIngredient('3 eggs', 4, 3);
            expect(result).toBe('2.25 eggs');
        });

        it('should handle very long decimals', () => {
            const result = scaleIngredient('5 eggs', 7, 3);
            expect(result).toBe('2.14 eggs');
        });
    });

    describe('Fraction Conversion', () => {
        it('should convert 0.5 to 1/2', () => {
            const result = scaleIngredient('1 cup milk', 4, 2);
            expect(result).toBe('1/2 cup milk');
        });

        it('should convert 0.25 to 1/4', () => {
            const result = scaleIngredient('1 cup butter', 4, 1);
            expect(result).toBe('1/4 cup butter');
        });

        it('should convert 0.75 to 3/4', () => {
            const result = scaleIngredient('1 cup water', 4, 3);
            expect(result).toBe('3/4 cup water');
        });

        it('should convert 0.333 to 1/3', () => {
            const result = scaleIngredient('1 cup oil', 3, 1);
            expect(result).toBe('1/3 cup oil');
        });

        it('should convert 0.667 to 2/3', () => {
            const result = scaleIngredient('1 cup flour', 3, 2);
            expect(result).toBe('2/3 cup flour');
        });

        it('should convert 0.125 to 1/8', () => {
            const result = scaleIngredient('1 tsp salt', 8, 1);
            expect(result).toBe('1/8 tsp salt');
        });

        it('should not convert uncommon decimals to fractions', () => {
            const result = scaleIngredient('7 eggs', 4, 3);
            expect(result).toBe('5.25 eggs');
        });
    });

    describe('Fraction Input Handling', () => {
        it('should parse and scale 1/2 correctly', () => {
            const result = scaleIngredient('1/2 tsp salt', 4, 8);
            expect(result).toBe('1 tsp salt');
        });

        it('should parse and scale 1/4 correctly', () => {
            const result = scaleIngredient('1/4 cup butter', 2, 4);
            expect(result).toBe('1/2 cup butter');
        });

        it('should handle complex fractions like 2/3', () => {
            const result = scaleIngredient('2/3 cup oil', 3, 6);
            expect(result).toBe('1.33 cup oil');
        });

        it('should handle ingredients starting with fraction', () => {
            const result = scaleIngredient('1/2 cup melted butter', 4, 2);
            expect(result).toBe('1/4 cup melted butter');
        });

        it('should handle ingredients with fraction anywhere', () => {
            const result = scaleIngredient('around 1/2 cup of melted butter', 4, 2);
            expect(result).toBe('around 1/4 cup of melted butter');
        });
    });

    describe('Multiple Numbers', () => {
        it('should handle multiple numbers in one ingredient', () => {
            const result = scaleIngredient('2 cups (16 oz) flour', 4, 8);
            expect(result).toBe('4 cups (32 oz) flour');
        });

        it('should handle ranges like "2-3 cloves"', () => {
            const result = scaleIngredient('2-3 cloves garlic', 4, 8);
            expect(result).toBe('4-6 cloves garlic');
        });

        it('should scale all numbers in complex ingredient descriptions', () => {
            const result = scaleIngredient('2 (about 225 g) onions', 2, 4);
            expect(result).toBe('4 (about 450 g) onions');
        });
    });

    describe('Edge Cases', () => {
        it('should not change ingredients without numbers', () => {
            const result = scaleIngredient('salt to taste', 4, 8);
            expect(result).toBe('salt to taste');
        });

        it('should handle ingredients with only text', () => {
            const result = scaleIngredient('fresh herbs', 4, 8);
            expect(result).toBe('fresh herbs');
        });

        it('should preserve text before and after numbers', () => {
            const result = scaleIngredient('about 2 cups of fresh broth', 4, 8);
            expect(result).toBe('about 4 cups of fresh broth');
        });

        it('should handle very small scaling', () => {
            const result = scaleIngredient('1 tsp vanilla sugar', 8, 1);
            expect(result).toBe('1/8 tsp vanilla sugar');
        });

        it('should handle large scaling', () => {
            const result = scaleIngredient('1 cup flour', 1, 23);
            expect(result).toBe('23 cup flour');
        });

        it('should handle zero in ingredient without scaling it', () => {
            const result = scaleIngredient('0 calorie sweetener, 2 tsp', 2, 4);
            expect(result).toBe('0 calorie sweetener, 4 tsp');
        });
    });

    describe('Non-Quantity Numbers', () => {
        it('should not scale percentages', () => {
            const result = scaleIngredient('85% dark chocolate', 2, 4);
            expect(result).toBe('85% dark chocolate');
        });

        it('should not scale temperatures', () => {
            const result = scaleIngredient('Bake at 190°C', 2, 4);
            expect(result).toBe('Bake at 190°C');
        });

        it('should handle percentage with space', () => {
            const result = scaleIngredient('Milk (2% fat)', 2, 4);
            expect(result).toBe('Milk (2% fat)');
        });

        it('should still scale actual quantities before percentages', () => {
            const result = scaleIngredient('200g 85% dark chocolate', 2, 4);
            expect(result).toBe('400g 85% dark chocolate');
        });

        it('should handle temperature in Farenheit', () => {
            const result = scaleIngredient('Bake at 350°F', 2, 4);
            expect(result).toBe('Bake at 350°F');
        });
        
    })

    describe('scaleIngredients', () => {
        it('should scale an array of ingredients', () => {
            const ingredients = ['2 cups flour', '1 cup sugar', '3 eggs'];
            const result = scaleIngredients(ingredients, 4, 8);

            expect(result).toEqual([
                '4 cups flour',
                '2 cup sugar',
                '6 eggs'
            ]);
        });

        it('should handle empty array', () => {
            const result = scaleIngredients([], 4, 8);
            expect(result).toEqual([]);
        });

        it('should handle array with mixed ingredient types', () => {
            const ingredients = [
                '2 cups flour',
                'salt to taste',
                '1/2 cup butter',
                '3 eggs'
            ];
            const result = scaleIngredients(ingredients, 4, 2);

            expect(result).toEqual([
                '1 cups flour',
                'salt to taste',
                '1/4 cup butter',
                '1.5 eggs'
            ]);
        });

        it('should maintain array order', () => {
            const ingredients = ['3 eggs', '2 cups flour', '1 cup sugar'];
            const result = scaleIngredients(ingredients, 2, 4);

            expect(result[0]).toBe('6 eggs');
            expect(result[1]).toBe('4 cups flour');
            expect(result[2]).toBe('2 cup sugar');
        });

        it('should handle single-item array', () => {
            const result = scaleIngredients(['2 cups flour'], 4, 8);
            expect(result).toEqual(['4 cups flour']);
        });
    });

});