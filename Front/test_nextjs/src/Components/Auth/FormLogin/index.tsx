import { useUser } from "@/EncapsulatedContext";
import { SignInResponse, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRef, useState } from "react";
import { ulid } from "ulidx";

export async function FormLogin() {

    const user = await useUser()
    if (user) {
        redirect('/')
    }

    const email = useRef<HTMLInputElement>(null)
    const senha = useRef<HTMLInputElement>(null)
    const lembrar = useRef<HTMLInputElement>(null)

    const [isError, setIsError] = useState<boolean>(false)
    const [msgError, setMsgError] = useState<string>('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.current?.value || !senha.current?.value || !lembrar.current?.checked) {
            setIsError(true)
            setMsgError('Preencha todos os campos')
            return
        }

        const dados = {
            id: ulid(),
            email: email.current.value,
            password: senha.current.value,
            lembrar: lembrar.current.checked
        }

        const Response: SignInResponse | undefined = await signIn('credentials', {
            redirect: false,
            email: dados.email,
            password: dados.password
        });

        if (Response && !Response.ok) {
            setIsError(true)
            const error = Response.error
            setMsgError(error!)
            return
        }
        redirect('/');
    }


    return (
        <form onSubmit={handleSubmit} className='form-login' >

            {isError && <p className='error-msg'>{msgError}</p>}
            <label className='label-email' htmlFor='input-email' >Email</label>
            <input type="email" placeholder="Email" className='input-email' />

            {isError && <p className='error-msg'>{msgError}</p>}
            <label className='label-senha' htmlFor='input-senha' >Senha</label>
            <input type="password" placeholder="Senha" className='input-senha' />

            <input type='checkbox' className='checkbox-lembrar' />
            <label className='label-lembrar' htmlFor='checkbox-lembrar'  >Lembrar-me</label>

            <input type="submit" value="Entrar" className='button-entrar' />
        </form >

    )
}