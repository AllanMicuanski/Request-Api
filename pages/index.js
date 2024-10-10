import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [permalink, setPermalink] = useState(null);
  const [message, setMessage] = useState(""); // Novo estado para a mensagem

  const handleVerify = async () => {
    setLoading(true); // Ativa o loading
    const response = await fetch(
      `/api/verificar?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    console.log(data); // Log para verificar a resposta

    setLoading(false); // Desativa o loading

    // Verifica se a resposta contém requisições
    if (Array.isArray(data.requisitions)) {
      setResults(data.requisitions); // Atualiza o estado com as requisições
      setPermalink(data.permalink); // Atualiza o permalink
      setMessage(""); // Limpa a mensagem
    } else {
      setResults([]); // Reseta os resultados se não houver requisições
      setPermalink(data.permalink); // Mantém o permalink
      setMessage(data.message); // Define a mensagem
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="container">
      <h1>Verificar Sizebay</h1>
      <input
        type="text"
        className="input"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Digite a URL do e-commerce"
      />
      <button className="button" onClick={handleVerify} disabled={loading}>
        {loading ? "Verificando..." : "Verificar"}
      </button>
      <button className="button toggle" onClick={toggleDarkMode}>
        {darkMode ? "Modo Claro" : "Modo Escuro"}
      </button>

      {/* Exibindo mensagem de status e permalink */}
      {message && <div className="message">{message}</div>}
      {permalink && (
        <div className="permalink">
          <strong>Permalink encontrado:</strong>{" "}
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            {permalink}
          </a>
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          <h2>Requisições encontradas:</h2>
          {results.map((req, index) => (
            <div className="result-item" key={index}>
              <strong>URL:</strong> {req.url}
              <br />
              <strong>Método:</strong> {req.method}
              <br />
              <strong>Headers:</strong> {JSON.stringify(req.headers)}
            </div>
          ))}
        </div>
      )}
      {results.length === 0 && !loading && (
        <div className="no-results">Nenhuma requisição encontrada.</div>
      )}
    </div>
  );
}
