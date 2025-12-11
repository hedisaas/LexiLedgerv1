/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}" // Catch root files like App.tsx if in root
    ],
    theme: {
        extend: {
            colors: {
                slate: {
                    850: '#1e293b',
                    900: '#0f172a',
                },
                primary: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    850: '#0c4a6e',
                    900: '#082f49',
                }
            }
        },
    },
    plugins: [],
}
