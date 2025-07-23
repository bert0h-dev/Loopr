import { h, render } from 'preact';
import { CalendarApp } from './CalendarApp.jsx';

const appElement = document.getElementById('app-init');

render(<CalendarApp />, appElement);
