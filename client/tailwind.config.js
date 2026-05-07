/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                'linen': '#f8f7fc',
                'lavender-light': '#ddd8f0',
                'lavender': '#8b7fc4',
                'plum': '#3d3650',
            }
        },
    },
    plugins: [],
}