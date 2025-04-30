import React, { useState, useEffect } from "react";
import JsBarcode from "jsbarcode";
import "./App.css";
<meta name="viewport" content="width=device-width, initial-scale=1"></meta>

function App() {
  const [input, setInput] = useState("");
  const [etiquetas, setEtiquetas] = useState([]);

  const gerarEtiquetas = () => {
    const linhas = input.trim().split("\n");
    const dados = [];
    const mensagensDeErro = [];

    linhas.forEach((linha, index) => {
      const partes = linha.trim().split(/\s+/);
      let codigo = "", nome = "", preco = "";

      const ultimaParte = partes[partes.length - 1];
      if (/^\d+([.,]\d{1,2})?$/.test(ultimaParte)) {
        preco = parseFloat(ultimaParte.replace(",", "."))
          .toFixed(2)
          .replace(".", ",");
        partes.pop();
      }

      if (partes.length > 0 && /^\d+$/.test(partes[0])) {
        codigo = partes.shift();
      }

      nome = partes.join(" ");

      const faltando = [];
      if (!codigo) faltando.push("código");
      if (!nome) faltando.push("nome");
      if (!preco) faltando.push("preço");

      if (faltando.length > 0) {
        mensagensDeErro.push(`Linha ${index + 1}: Faltando ${faltando.join(", ")}`);
      }

      dados.push({ codigo, nome, preco });
    });

    setEtiquetas(dados);

    if (mensagensDeErro.length > 0) {
      alert("Algumas etiquetas foram geradas com dados incompletos:\n\n" + mensagensDeErro.join("\n"));
    }
  };

  const limparCampos = () => {
    setInput("");
    setEtiquetas([]);
  };

  const imprimir = () => {
    window.print();
  };

  const totalEtiquetas = 24;
  const etiquetasCompletas = [...etiquetas];
  while (etiquetasCompletas.length % totalEtiquetas !== 0) {
    etiquetasCompletas.push({ codigo: "", nome: "", preco: "" });
  }

  const dividirEmPaginas = (etiquetas, tamanhoPagina = 24) => {
    const paginas = [];
    for (let i = 0; i < etiquetas.length; i += tamanhoPagina) {
      paginas.push(etiquetas.slice(i, i + tamanhoPagina));
    }
    return paginas;
  };

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
          console.error(`Erro ao gerar código de barras para o código: ${codigo}`, error);
        }
      }
    });
  };

  useEffect(() => {
    gerarCodigoBarras();
  }, [etiquetas]);

  const linhasTexto = input.split("\n");

  return (
    <div className="container">
      <h1 className="titulo">Gerador de Etiquetas</h1>

      <div className="editor-container">
        <div className="linhas">
          {linhasTexto.map((_, index) => (
            <div key={index} className="linha-numero">
              {index + 1}
            </div>
          ))}
        </div>
        <textarea
          rows={10}
          className="inputTexto"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Insira os dados do produto (ex: 74562587 Biscoito 3,50)"
        />
      </div>

      <div className="botoes">
        <button className="botaoAzul" onClick={gerarEtiquetas}>
          Gerar Etiquetas
        </button>
        <button className="botaoVermelho" onClick={limparCampos}>
          Limpar Campos
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

              const isVazia = !item.codigo && !item.nome && !item.preco;

              if (isVazia) {
                return <div key={globalIndex} className="etiqueta"></div>;
              }

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
                      <div className="precoProduto">{item.preco}</div>
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