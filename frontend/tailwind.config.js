/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			marcellus: [
  				'Marcellus',
  				'serif'
  			]
  		},
  		colors: {
  			primary: '#212123',
  			secondary: '#8f8f8f',
			'heavenly-dark': '#1a1a1a',
			'heavenly-gold': '#c9a747',
  		},
		
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
}