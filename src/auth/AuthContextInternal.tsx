import { createContext } from 'react';
import type { AuthState } from './AuthContext';

export const AuthContext = createContext<AuthState | null>(null);

