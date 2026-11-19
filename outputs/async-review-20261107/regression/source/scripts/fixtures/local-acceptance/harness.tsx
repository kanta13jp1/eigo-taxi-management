// This entry is served by the local rehearsal runner only; it is not a production entry.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../../src/App';
import { ApiService } from '../../../src/services/api';
import '../../../src/index.css';
Object.assign(window, { __localRehearsalApi: ApiService });
createRoot(document.getElementById('root')!).render(<App />);
