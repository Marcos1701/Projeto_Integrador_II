import axios from "axios";
import React, { createContext, useContext, useMemo, useState } from "react";
import { redirect } from "react-router-dom";
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client';

export type User = {
    nome: string;
    access_token: string;
}

export type singinData = {
    email: string;
    senha: string;
    lembrar?: boolean;
}

export type singupData = {
    nome: string;
    email: string;
    senha: string;
    lembrar?: boolean;
}


interface AuthContextType {
    user: User | null
    signin: (data: singinData) => Promise<string | void>
    singup: (user: singupData) => Promise<string | void>
    signout: () => void
    isAuthenticated: boolean
    loading?: boolean,
    client: ApolloClient<NormalizedCacheObject>,
    RefreshUser: () => void
}

const defaultValue = {} as AuthContextType

const AuthContext = createContext<AuthContextType>(defaultValue)

interface AuthProviderProps {
    children: React.ReactNode
}

export const api_url: string = "https://finnapp.onrender.com/";
const graphql_url: string = api_url.replace('api/', 'graphql/')
//"http://localhost:3000/"
//"https://legendary-space-spoon-gvjqgjx7gx92vv5g-3300.app.github.dev/"
//https://finnapp.onrender.com/ => link da api no render

// AuthProvider encapsula o AuthContextProvider e o AuthContext
export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(
        localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')!)
            : null
    )

    const RefreshUser = () => {
        const access_token = localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('access_token')!)
            : null

        const nome = localStorage.getItem('access_token') ? JSON.parse(localStorage.getItem('nome')!)
            : null

        setUser({
            access_token,
            nome
        })
    }

    const [loading, setLoading] = useState<boolean>(false)

    const signin = async (data: singinData): Promise<string | void> => {

        setLoading(true)
        const response = await axios.post<User>(`${api_url}auth/login`, {
            email: data.email,
            senha: data.senha
        })

        if (response.status !== 200) {
            setLoading(false)
            return response.status === 401 ? response.statusText : 'Ops, ocorreu um erro ao fazer login';
        }

        if (data.lembrar) {
            localStorage.setItem('access_token', JSON.stringify(response.data))
        }

        setUser(response.data);
        setLoading(false)
    }

    const singup = async (user: singupData): Promise<string | void> => {

        setLoading(true)
        const response = await axios.post<User>(`${api_url}auth/signup`, {
            nome: user.nome,
            email: user.email,
            senha: user.senha
        })

        if (response.status !== 201) {
            setLoading(false)
            return response.status === 401 ? response.statusText : 'Ops, ocorreu um erro ao realizar o cadastro..';
        }

        if (user.lembrar) {
            localStorage.setItem('access_token', JSON.stringify(response.data))
        }
        setUser(response.data);
        setLoading(false)
    }

    const signout = (): void => {
        setLoading(true)
        setUser(null);
        localStorage.removeItem('access_token');
        setLoading(false)
        redirect('/')
    }

    const client = useMemo(() => new ApolloClient({
        uri: graphql_url,
        cache: new InMemoryCache(),
        defaultOptions: {
            query: {
                variables: {
                    access_token: user ? user.access_token : ''
                }
            }
        }
    }), [user])

    const value = useMemo(() => ({
        user, signin, singup, signout, isAuthenticated: user != null, loading, client, RefreshUser
    }), [user, loading])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const authContext = useContext(AuthContext)

    if (!authContext)
        throw new Error('useAuth fora do AuthProvider!')

    return authContext
}
