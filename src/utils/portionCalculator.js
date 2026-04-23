/**
 * Scales a single ingredient quantity based on serving ratio
 * @param {string} ingredient - e.g., "2 cups flour"
 * @param {number} originalServings - original recipe servings
 * @param {number} newServings - desired servings
 * @returns {string} scaled ingredient - e.g., "4 cups flour"
 */

export const scaleIngredient = (ingredient, originalServings, newServings) => {
    const ratio = newServings / originalServings;

    //Match numbers (including fractions and decimals)
    const numberPattern = /(\d+\/\d+|\d+\.?\d*)(?![°%\d])/g; // dive deeper into this type of expressions

    return ingredient.replace(numberPattern, (match) => {
        let num;

        //Handle fractions
        if (match.includes('/')) {
            const [numerator, denominator] = match.split('/').map(Number);
            num = numerator / denominator;
        } else {
            num = parseFloat(match);
        }

        const scaled = num * ratio;

        //Format the result nicely
        if (scaled % 1 === 0) {
          return scaled.toString();
        } else if (scaled < 1) {
            //Try to convert to fraction
          return convertToFraction(scaled) || formatDecimal(scaled);
        }

        return formatDecimal(scaled);
    });
};

/**
 * Converts decimal to common cooking fraction
 * @param {number} decimal - decimal number like 0.5
 * @returns {string|null} fraction string like 1/2 or null if no match
 */

const convertToFraction = (decimal) => {
    const fractions = {
        0.125: '1/8',
        0.25: '1/4',
        0.333: '1/3',
        0.5: '1/2',
        0.667: '2/3',
        0.75: '3/4'
    };
    
    for (const [dec, frac] of Object.entries(fractions)) {
        if (Math.abs(decimal - parseFloat(dec)) < 0.01) {
            return frac;
        }
    }
    return null;
};

/**
 * Formats number as clean decimal (removes trailing zeros)
 * @param {number} num - number to format
 * @returns {string} formatted string like 1.5 or 2
 */

const formatDecimal = (num) => {
    return num.toFixed(2).replace(/\.?0+$/, '');
};

/**
 * Scales an entire array of ingredients
 * @param {string[]} ingredients - array of ingredient srtings
 * @param {number} originalServings
 * @param {number} newServings
 * @returns {string[]} array of scaled ingredients 
 */

export const scaleIngredients = (ingredients, originalServings, newServings) => {
    return ingredients.map(ing =>
        scaleIngredient(ing, originalServings, newServings)
    );
};