
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add this to ensure no browser default margins/padding
document.documentElement.classList.add('bg-secondary/50');
document.body.classList.add('bg-secondary/50');
document.body.style.margin = '0';
document.body.style.padding = '0';

createRoot(document.getElementById("root")!).render(<App />);
