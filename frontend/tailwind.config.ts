
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx,js,jsx}",
		"./components/**/*.{ts,tsx,js,jsx}",
		"./app/**/*.{ts,tsx,js,jsx}",
		"./src/**/*.{ts,tsx,js,jsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter var', 'Inter', 'sans-serif'],
				mono: ['JetBrains Mono', 'monospace'],
				space: ['Space Grotesk', 'sans-serif'],
				heading: ['Orbitron', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				space: {
					'deep-blue': '#0B1026',
					'nebula-purple': '#3B185F',
					'cosmic-blue': '#0E4C92',
					'star-white': '#F9F9F9',
					'cosmic-accent': '#FF7B54',
					'planet-teal': '#00FFC6',
					'planet-orange': '#FF5E00',
					'nebula-pink': '#FF00E5',
				},
				milk: {
					base: 'var(--color-milk-base)',
					muted: 'var(--color-milk-muted)',
					dimmed: 'var(--color-milk-dimmed)',
					hover: 'var(--color-milk-hover)',
					emphasis: 'var(--color-milk-emphasis)',
					'bg-subtle': 'var(--color-milk-bg-subtle)',
					'bg-card': 'var(--color-milk-bg-card)',
					'bg-light': 'var(--color-milk-bg-light)',
					'bg-medium': 'var(--color-milk-bg-medium)',
					'border-subtle': 'var(--color-milk-border-subtle)',
					'border-default': 'var(--color-milk-border-default)',
				},
				highlight: 'var(--color-highlight)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-in-up': {
					from: { 
						opacity: '0',
						transform: 'translateY(10px)'
					},
					to: { 
						opacity: '1',
						transform: 'translateY(0)'
					},
				},
				'slide-in-right': {
					from: { transform: 'translateX(100%)' },
					to: { transform: 'translateX(0)' },
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'spin-slow': {
					from: { transform: 'rotate(0deg)' },
					to: { transform: 'rotate(360deg)' },
				},
				'twinkle': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.5', transform: 'scale(0.8)' },
				},
				'space-float': {
					'0%, 100%': { transform: 'translate(0, 0)' },
					'25%': { transform: 'translate(2px, -2px)' },
					'50%': { transform: 'translate(0, -4px)' },
					'75%': { transform: 'translate(-2px, -2px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
				'float': 'float 3s infinite ease-in-out',
				'spin-slow': 'spin-slow 20s linear infinite',
				'twinkle': 'twinkle 4s infinite ease-in-out',
				'space-float': 'space-float 15s infinite ease-in-out',
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)',
			},
			backgroundImage: {
				'space-gradient': 'linear-gradient(to bottom, #0B1026, #1C1B33)',
				'nebula-gradient': 'linear-gradient(to right, rgba(59, 24, 95, 0.8), rgba(14, 76, 146, 0.8))',
				'cosmic-glow': 'radial-gradient(circle, rgba(255, 0, 229, 0.15), transparent 70%)',
				'star-field': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'400\' viewBox=\'0 0 800 800\'%3E%3Cg fill=\'none\' stroke=\'%23FFFFFF\' stroke-opacity=\'0.5\'%3E%3Ccircle r=\'1\' cx=\'100\' cy=\'100\'/%3E%3Ccircle r=\'1\' cx=\'200\' cy=\'150\'/%3E%3Ccircle r=\'1\' cx=\'300\' cy=\'250\'/%3E%3Ccircle r=\'1\' cx=\'400\' cy=\'100\'/%3E%3Ccircle r=\'1\' cx=\'500\' cy=\'350\'/%3E%3Ccircle r=\'1\' cx=\'600\' cy=\'200\'/%3E%3Ccircle r=\'1\' cx=\'700\' cy=\'300\'/%3E%3Ccircle r=\'1\' cx=\'100\' cy=\'400\'/%3E%3Ccircle r=\'1\' cx=\'250\' cy=\'500\'/%3E%3Ccircle r=\'1\' cx=\'350\' cy=\'450\'/%3E%3Ccircle r=\'1\' cx=\'450\' cy=\'500\'/%3E%3Ccircle r=\'1\' cx=\'550\' cy=\'450\'/%3E%3Ccircle r=\'1\' cx=\'650\' cy=\'550\'/%3E%3Ccircle r=\'1\' cx=\'150\' cy=\'600\'/%3E%3Ccircle r=\'1\' cx=\'250\' cy=\'650\'/%3E%3Ccircle r=\'1\' cx=\'350\' cy=\'700\'/%3E%3Ccircle r=\'1\' cx=\'450\' cy=\'650\'/%3E%3Ccircle r=\'1\' cx=\'550\' cy=\'700\'/%3E%3Ccircle r=\'1\' cx=\'650\' cy=\'600\'/%3E%3C/g%3E%3C/svg%3E")',
			},
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
