import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permalink, setPermalink] = useState(null);
  const [message, setMessage] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState({
    script: false,
    gtm: false,
    vtexIO: false,
  });

  const handleVerify = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/verificar?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    console.log(data);

    setLoading(false);

    if (Array.isArray(data.requisitions)) {
      setResults(data.requisitions);
      setPermalink(data.permalink);
      setMessage("");
      setDeploymentStatus({
        script: data.scriptStatus,
        gtm: data.gtmStatus,
        vtexIO: data.vtexIOStatus,
      });
    } else {
      setResults([]);
      setPermalink(data.permalink);
      setMessage(data.message);
    }
  };

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

      {/* Exibe mensagem de status e permalink */}
      {message && <div className="message">{message}</div>}
      {permalink && (
        <div className="permalink">
          <strong>Permalink encontrado:</strong>{" "}
          <a href={permalink} target="_blank" rel="noopener noreferrer">
            {permalink}
          </a>
        </div>
      )}

      {/* Exibe requisições capturadas */}
      {results.length > 0 && (
        <div className="results">
          <h2>Requisições capturadas:</h2>
          {results.map((req, index) => (
            <div className="result-item" key={index}>
              <strong>URL:</strong> {req.url}
              <br />
              <strong>Método:</strong> {req.method}
            </div>
          ))}
        </div>
      )}

      {/* Exibe status de implantação */}
      <div className="deployment-status">
        <h3>Status de Implantação:</h3>
        <ul>
          <li>Script: {deploymentStatus.script ? "✅" : "❌"}</li>
          <li>GTM: {deploymentStatus.gtm ? "✅" : "❌"}</li>
          <li>VTEX IO: {deploymentStatus.vtexIO ? "✅" : "❌"}</li>
        </ul>
      </div>
    </div>
  );
}
