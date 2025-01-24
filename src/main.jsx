import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider } from 'primereact/api';
import ApiAlert from './features/utils/ApiAlert.jsx';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';

createRoot(document.getElementById('root')).render(
        <>
                <PrimeReactProvider>
                        <App/>
                </PrimeReactProvider>
                <ApiAlert id = {'loading'} message={"Loading..."}/>
                <ApiAlert id = {'saving'} message={"Saving..."}/>
                <ApiAlert id = {'success'} message={"Save Successful!"} graphic = {false} color = {"green"}/>
                <ApiAlert id = {'error'} message={"Error!"} graphic = {false} color = {"red"}/>
        </>
)
