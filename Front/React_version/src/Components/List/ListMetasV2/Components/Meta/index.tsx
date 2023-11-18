import { useState } from "react";
import "./Meta.css";
import { Navigate } from "react-router-dom";
import { IMeta } from "../../../ListMetas/Components/Meta";
import { tratarData } from "../../../ListTransacoesCard/Components/Transacao";
import { realizarTratamentoValor } from "../../../../Home/Components/SecaoAcoes/Components/Saldo";

interface IMetaBoxProps {
    meta: IMeta
}

export const MetaBox = (
    {
        meta
    }: IMetaBoxProps
): JSX.Element => {

    const [showDetails, setShowDetails] = useState(false);

    return (
        <a className="meta-box" id={meta.id} onClick={() => setShowDetails(!showDetails)}
            style={{ // cor do background de acordo com a porcentagem de conclusão da meta
                background: meta.progresso > 0 ? `linear-gradient(90deg, #00a60e4f ${meta.progresso}%, #d3d8d7 ${100 - meta.progresso}%)` : 'transparent'
            }}
            title={meta.progresso + '% concluído'}
        >
            {showDetails && (<Navigate to={`/metas/${meta.id}`} />)}

            <div className="navbar">
                <div className="text-wrapper">{meta.titulo}</div>
                <div className="text-wrapper-2">{tratarData(meta.dataFinal.toISOString(), 'simplificado')}</div>
                <div className="text-wrapper-3">R$ {realizarTratamentoValor(meta.valor_Desejado)}</div>
                <div className="text-wrapper-4">R$ {realizarTratamentoValor(meta.valor_Atual)}</div>
            </div>
            <svg id="vector" width="550" height="2" viewBox="0 0 545 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.496094 0.805695H544.239" stroke="#2844BD" strokeWidth="0.5" />
            </svg>

        </a>
    );
};