import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import loginService from '../../services/login';
import {AppDispatch} from "../index.ts";

interface User {
    email: string;
    token: string;
}

interface AuthState {
    user: User | null;
}

interface LoginPayload {
    email: string;
    password: string;
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

export const loginAction = ({ email, password }: LoginPayload) => {
    console.log("Login Action!")
    return async (dispatch: AppDispatch) => {
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