import { ICategoria } from "@/Components/Categoria";
import { ITransacao, Transacao } from "@/Components/Transacao";
import { useAuth } from "@/Contexts/AuthContext";
import { useUser } from "@/EncapsulatedContext";
import { Suspense } from "react";


interface IListTransacoesProps {
    page?: number;
    limit?: number;
}

export async function ListTransacoes({ page = 1, limit = 10 }: IListTransacoesProps) {

    const user = await useUser();
    const transacoes: ITransacao[] = await fetch(`http://localhost:3300/Transacao/${user!.id}`).then(res => res.json()).catch(err => {
        console.log(err)
        return []
    })
    const categorias: ICategoria[] = await fetch(`http://localhost:3300/Categoria/${user!.id}`).then(res => res.json()).catch(err => {
        console.log(err)
        return []
    })

    return (
        <Suspense fallback={
            <div className="transacoes-home-skeleton">
            </div>
        }>
            <div className="transacoes-home">
                {
                    transacoes
                        .slice((page - 1) * limit, page * limit)
                        .map(
                            (transacao: ITransacao) => {
                                const categoria: ICategoria | undefined = categorias.find(
                                    (categoria: ICategoria) => categoria.id === transacao.id_categoria
                                );

                                if (!categoria) {
                                    return <p>Erro: Categoria não encontrada</p>
                                }

                                return (
                                    <Transacao
                                        transacao={transacao}
                                        categoria={categoria}
                                    />
                                )
                            }
                        )
                }
            </div>
        </Suspense>
    )
}