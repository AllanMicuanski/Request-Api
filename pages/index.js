import { useState, useEffect } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const handleVerify = async () => {
    const response = await fetch(
      `/api/verificar?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();

    // Acesse a chave correta 'requisitions'
    if (Array.isArray(data.requisitions)) {
      setResults(data.requisitions);
    } else {
      setResults([]);
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
      <button className="button" onClick={handleVerify}>
        Verificar
      </button>
      <button className="button toggle" onClick={toggleDarkMode}>
        {darkMode ? "Modo Claro" : "Modo Escuro"}
      </button>
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
    </div>
  );
}
