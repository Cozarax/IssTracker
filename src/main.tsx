import { createRoot } from 'react-dom/client';
import './styles/global.css';
import IssTrackerScene from './components/IssTrackerScene.tsx';

createRoot(document.getElementById('root')!).render(<IssTrackerScene />);
