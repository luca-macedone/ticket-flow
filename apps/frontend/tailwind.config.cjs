
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
        "../../packages/shared/src/**/*.{ts,html}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            fontSize: {
                sm: '0.667rem',
                base: '1rem',
                xl: '1.500rem',
                '2xl': '2.250rem',
                '3xl': '3.375rem',
                '4xl': '5.063rem',
                '5xl': '7.595rem',
            },
            fontFamily: {
                heading: 'LINE Seed JP',
                body: 'Urbanist',
            },
            fontWeight: {
                normal: '400',
                bold: '700',
            },
            colors: {
                'text': 'oklab(var(--text) / <alpha-value>)',
                'background': 'oklab(var(--background) / <alpha-value>)',
                'primary': 'oklab(var(--primary) / <alpha-value>)',
                'secondary': 'oklab(var(--secondary) / <alpha-value>)',
                'accent': 'oklab(var(--accent) / <alpha-value>)',
            },

        },
    },
    plugins: [],
};
