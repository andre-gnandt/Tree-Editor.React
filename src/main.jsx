import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider } from 'primereact/api';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')).render(
        <PrimeReactProvider>
                <App/>
        </PrimeReactProvider>

)
