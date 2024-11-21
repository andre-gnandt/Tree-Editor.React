import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider } from 'primereact/api';
import TreesMenu from './features/trees/TreesMenu.jsx';

createRoot(document.getElementById('root')).render(
        <PrimeReactProvider>
            <TreesMenu/>
        </PrimeReactProvider>
)
