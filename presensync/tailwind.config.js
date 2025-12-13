
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
                    light: '#2dd4bf', // teal-400
                    DEFAULT: '#0d9488', // teal-600
                    dark: '#115e59', // teal-800
                },
                secondary: {
                    light: '#fdba74', // orange-300
                    DEFAULT: '#f97316', // orange-500
                    dark: '#c2410c', // orange-700
                }
            }
        },
    },
    plugins: [],
}
