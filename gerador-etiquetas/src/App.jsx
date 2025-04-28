import React, { useState, useEffect } from "react";
import JsBarcode from "jsbarcode";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);

  // Gera as etiquetas a partir do input
  const gerarEtiquetas = () => {
    const linhas = input.trim().split("\n");
    const dados = linhas.map((linha) => {
      const partes = linha.split("\t");
      return {
        codigo: partes[0] || "",
        nome: partes[1] || "",
        preco: partes[2]
          ? parseFloat(partes[2].replace(",", ".")).toFixed(2).replace(".", ",")
          : "",
      };
    });
    setEtiquetas(dados);
  };

  // Função para imprimir
  const imprimir = () => {
    window.print();
  };

  // Número de etiquetas por página
  const totalEtiquetas = 24;

  // Preenche etiquetas para múltiplas páginas
  const etiquetasCompletas = [...etiquetas];

  while (etiquetasCompletas.length % totalEtiquetas !== 0) {
    etiquetasCompletas.push({ codigo: "", nome: "", preco: "" });
  }

  // Função que divide em páginas de 24
  const dividirEmPaginas = (etiquetas, tamanhoPagina = 24) => {
    const paginas = [];
    for (let i = 0; i < etiquetas.length; i += tamanhoPagina) {
      paginas.push(etiquetas.slice(i, i + tamanhoPagina));
    }
    return paginas;
  };

  // Gera o código de barras usando a biblioteca JsBarcode
  const gerarCodigoBarras = () => {
    etiquetasCompletas.forEach((item, index) => {
      const codigo = item.codigo.trim();
      if (/^[0-9]{13}$/.test(codigo)) {
        try {
          JsBarcode(`#barcode-${index}`, codigo, {
            format: "EAN13",
            width: 1.5,
            height: 30,
            displayValue: false,
            background: "#FFD700",
            lineColor: "#000000",
          });
        } catch (error) {
          console.error(`Erro ao gerar código de barras para o código: ${codigo}, error`);
        }
      }
    });
  };

  // Regenerar códigos de barras sempre que mudar etiquetas
  useEffect(() => {
    gerarCodigoBarras();
  }, [etiquetas]);

  return (
    <div className="container">
      <h1 className="titulo">Gerador de Etiquetas</h1>

      <textarea
        rows={8}
        className="inputTexto"
        placeholder="Cole os dados aqui no formato: CÓDIGO[TAB]NOME[TAB]PREÇO (apenas xx,xx)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      ></textarea>

      <div className="botoes">
        <button className="botaoAzul" onClick={gerarEtiquetas}>
          Gerar Etiquetas
        </button>
        <button className="botaoVerde" onClick={imprimir}>
          Imprimir
        </button>
      </div>

      {dividirEmPaginas(etiquetasCompletas).map((pagina, pageIndex) => (
        <div key={pageIndex} className="folhaA4">
          <div className="gradeEtiquetas">
            {pagina.map((item, index) => {
              const codigo = item.codigo.trim();
              const isCodigoValido = /^[0-9]{13}$/.test(codigo);
              const globalIndex = pageIndex * totalEtiquetas + index;

              return (
                <div key={globalIndex} className="etiqueta">
                  <div className="nomeProduto">{item.nome}</div>

                  <div className="areaInferior">
                    <div className="areaCodigo">
                      {isCodigoValido ? (
                        <>
                          <svg id={`barcode-${globalIndex}`} className="codigoBarras"></svg>
                          <div className="numeroCodigo">{codigo}</div>
                        </>
                      ) : (
                        <div className="codigoInterno">
                          {codigo && `Código ${codigo}`}
                        </div>
                      )}
                    </div>

                    <div className="areaPreco">
                      <div className="cifrao">R$</div>
                      <div className="precoProduto">
                      {item.preco && `${item.preco}`}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;