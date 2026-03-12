import '../../css/app.css';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';

const container = document.getElementById('app');

if (!container) {
    throw new Error('SPA root element not found.');
}

createRoot(container).render(
    <AuthProvider>
        <App />
    </AuthProvider>,
);
