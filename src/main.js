import '@/css/index.css';

import { h, render } from 'preact';
import { App } from './App.jsx';

const appElement = document.getElementById('app-init');

render(<App />, appElement);
