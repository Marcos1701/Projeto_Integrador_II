import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ListaMetas } from "../../List/ListMetasV2";


export function MetasPage() {

    const [voltar, setVoltar] = useState<boolean>(false);
    const [showAddItem, setShowAddItem] = useState<boolean>(false);
    return (
        <main className="page">
            {voltar && <Navigate to={'/'} />}
            <div className="page-header">
                <button onClick={() => { setVoltar(!voltar) }}
                    className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none">
                        <g clipPath="url(#clip0_206_145)">
                            <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="black" />
                        </g>
                        <defs>
                            <clipPath id="clip0_206_145">
                                <rect width="24" height="24" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </button>

                <h2 className="title">Metas</h2>

                <div className="AddItem">
                    <button className="AddItem-Button" onClick={() => setShowAddItem(!showAddItem)}>
                        <img src="assets/ActionsIcons/plus.svg" alt="Adicionar Item" />
                    </button>
                    <div className={
                        showAddItem ? "opcoes_adicionar-active" : "opcoes_adicionar"
                    } onMouseLeave={() => setShowAddItem(false)}>
                        <Link to="/metas/add">
                            Adicionar Meta
                        </Link>
                    </div>
                </div>
            </div>

            <ListaMetas page={1} limit={6} id="list_on_page" />
        </main>
    )
}