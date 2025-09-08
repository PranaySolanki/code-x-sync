/** @type {import('tailwindcss').Config} */
module.exports = {
    prefix: 'tw-',
    important: false,
    // I've updated this path for your project
    content: [
        "./src/screen/LandingPage/**/*.{html,js}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#7e22ce',
                secondary: "#080808",
                outlineColor: "#1F2123"
            }
        },
    },
    plugins: [],
}