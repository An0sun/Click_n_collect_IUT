/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // Bleu principal
        primary: {
          light: '#BFDBFE',   // bleu très clair
          DEFAULT: '#2563EB', // bleu standard
          dark: '#1D4ED8',    // bleu foncé
        },

        // Fond & cartes
        background: '#F3F4F6', // fond général
        card: '#FFFFFF',       // cartes, blocs

        // Texte & gris
        text: '#111827',       // quasi noir
        muted: '#6B7280',      // texte secondaire
        borderSubtle: '#E5E7EB',
        grayDark: '#374151',
        black: '#000000',
        white: '#FFFFFF',
      },
    },
  },
  plugins: [],
}
