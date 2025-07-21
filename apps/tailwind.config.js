/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
			fontFamily: {
				serif: ["CDCSerif", "serif"],
				sans: ["CDCSans", "sans-serif"],
			},
			fontWeight: {
				light: "300",
				normal: "400",
				book: "500",
				semibold: "600",
				bold: "700",
			},
			borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
			warning: {
				DEFAULT: 'hsl(var(--warning))',
				foreground: 'hsl(var(--warning-foreground))',
				background: 'hsl(var(--warning-background))',
				border: 'hsl(var(--warning-border))',
			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
				'brand-red': 'hsl(var(--brand-red))',
				'red-hover': 'hsl(var(--red-hover))',
				'dark-purple': 'hsl(var(--dark-purple))',
				'brand-blue': 'hsl(var(--brand-blue))',
				'brand-blue-medium': 'hsl(var(--brand-blue-medium))',
				'cdc-black': 'hsl(var(--cdc-black))',
				'grey-dark': 'hsl(var(--grey-dark))',
				'cold-grey': {
					1: 'hsl(var(--cold-grey-001))',
					2: 'hsl(var(--cold-grey-002))',
					3: 'hsl(var(--cold-grey-003))',
					4: 'hsl(var(--cold-grey-004))',
				},
				'neutral-grey': {
					medium: 'hsl(var(--neutral-grey-medium))',
					light: 'hsl(var(--neutral-grey-light))',
				},
				'soft-purple': {
					DEFAULT: 'hsl(var(--soft-purple))',
				},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
