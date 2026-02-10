/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3d4f6f',
                    dark: '#2c3a52',
                    light: '#5a7aa0',
                },
                secondary: {
                    DEFAULT: '#5a7aa0',
                    dark: '#3d4f6f',
                },
                protein: '#64748b',
                carbs: '#64748b',
                fat: '#64748b',
                slate: {
                    750: '#293548',
                },
            },
            fontFamily: {
                inter: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
            },
        },
    },
    plugins: [],
}
