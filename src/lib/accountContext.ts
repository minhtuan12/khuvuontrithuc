import { createContext, useContext } from 'react';
import type { AccountUser } from './accountApi';
export const AccountContext = createContext<{ user: AccountUser | null; openAccount: () => void }>({ user: null, openAccount: () => {} });
export const useAccount = () => useContext(AccountContext);
export const useTeacherAccess = () => useAccount().user?.role === 'teacher';
