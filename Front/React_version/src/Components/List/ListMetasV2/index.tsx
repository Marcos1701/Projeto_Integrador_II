import { useContext, useState } from "react"
import { IMetaContext, MetasContext } from "../../../Contexts/MetasContext"
import { MetaBox } from "./Components/Meta";
import './ListaMetas.css'
import { IMeta } from "./Components/Meta";
import { Orderdiv } from "./Components/Orderdiv";
import { Searchdiv } from "./Components/Searchdiv";
import { MagicMotion } from "react-magic-motion";
import { ScaleLoader } from "react-spinners";

interface IListaMetasProps {
    limit?: number
    pagination?: boolean
    orderSelect?: boolean
    searchInput?: boolean
    page?: number
    classname?: string
    id?: string
    setShowDetails?: React.Dispatch<React.SetStateAction<boolean>>
    setMeta?: React.Dispatch<React.SetStateAction<IMeta | undefined>>
}

export function ListaMetas(
    {
        limit = 4,
        pagination = true,
        orderSelect = true,
        searchInput = true,
        page = 1,
        id = "ListaMetas",
        setShowDetails,
        setMeta

    }: IListaMetasProps
): JSX.Element {

    const { metas, loading }: IMetaContext = useContext(MetasContext);
    const [pageAtual, setPageAtual] = useState<number>(page);

    return (
        <div className="ListaMetas" id={id}>
            {(searchInput || orderSelect) && (
                <div className="search-order">
                    {orderSelect && <Orderdiv />}
                    {searchInput && <Searchdiv />}
                </div>
            )}

            {id !== "list_on_page" &&
                <div className="header">
                    <h2>Metas</h2>
                </div>
            }

            {loading ? <ScaleLoader color="#7949FF" className="loader" /> :
                <MagicMotion layoutDependency={
                    [metas.length]
                } >
                    <ul className="list">
                        {metas.length === 0 && <li className="empty" key='EmptyMetas'>Nenhuma meta encontrada</li>}
                        {
                            metas
                                .slice(pageAtual * limit - limit, pageAtual * limit)
                                .map(
                                    (meta) => <li key={meta.id + "-li"} className="li-meta">
                                        <MetaBox
                                            meta={meta}
                                            key={meta.id}
                                            setShowDetails={setShowDetails}
                                            setMeta={setMeta}
                                        />
                                    </li>
                                )
                        }
                    </ul>
                </MagicMotion>
            }

            {
                pagination && <div className="pagination">
                    <a className={
                        pageAtual === 1 ? "pagination-button-disabled" : "pagination-button"} onClick={() => {
                            if (pageAtual > 1) {
                                setPageAtual(pageAtual - 1);
                            }
                        }}
                        id="previous"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <g clipPath="url(#clip0_206_145)">
                                <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="black" />
                            </g>
                            <defs>
                                <clipPath id="clip0_206_145">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg></a>
                    <a className="pagination-button-active">{pageAtual}</a>
                    {pageAtual < Math.ceil(metas.length / limit) && <a className="pagination-button" onClick={() => setPageAtual(pageAtual + 1)}>{pageAtual + 1}</a>}
                    {pageAtual + 1 < Math.ceil(metas.length / limit) && <a className="pagination-button" onClick={() => setPageAtual(pageAtual + 2)}>{pageAtual + 2}</a>}
                    <a className="pagination-button">...</a>
                    {pageAtual < Math.ceil(metas.length / limit) && <a className="pagination-button" onClick={() => setPageAtual(Math.ceil(metas.length / limit))}>{Math.ceil(metas.length / limit)}</a>}
                    <a className="pagination-button" onClick={() => {
                        if (pageAtual < Math.ceil(metas.length / limit)) {
                            setPageAtual(pageAtual + 1);
                        }
                    }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <g clipPath="url(#clip0_206_57)">
                                <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="black" />
                            </g>
                            <defs>
                                <clipPath id="clip0_206_57">
                                    <rect width="24" height="24" fill="white" />
                                </clipPath>
                            </defs>
                        </svg></a>
                </div>
            }
        </div>
    )
}