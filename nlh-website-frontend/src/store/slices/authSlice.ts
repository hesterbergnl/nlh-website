import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import loginService from '../../services/login';

interface User {
    email: string;
    token: string;
}

interface AuthState {
    user: User | null;
}

const initialState: AuthState = {
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<User>) {
            state.user = action.payload;
        },
        logout(state) {
            state.user = null;
        },
    },
});

export const loginAction = ({ email, password }: { email: string; password: string }) => {
    console.log("Login Action!")
    return async (dispatch: any) => {
        try {
            const data = await loginService.login({email, password});
            console.log(data);
            dispatch(login(data));
        } catch (error) {
            console.error('Login failed:', error);
        }
    }
}

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;