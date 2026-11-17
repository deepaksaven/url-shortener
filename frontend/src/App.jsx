import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlHistory, setUrlHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShorten = async () => {
    if (!originalUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShortUrl("");
      setCopied(false);

      const response = await fetch("http://localhost:5001/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl: originalUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const completeUrl = data.shortUrl.startsWith("http")
        ? data.shortUrl
        : `http://localhost:5001/api/${data.shortUrl}`;

      setShortUrl(completeUrl);
      await fetchHistory();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      setError("Unable to copy the URL. Please copy it manually.");
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await fetch("http://localhost:5001/api/history");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch history");
      }

      setUrlHistory(data.urls);
    } catch (error) {
      setError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="page-shell">
      <section className="container" aria-labelledby="page-title">
        <header className="card-header">
          <div className="heading-copy">
            <h1 id="page-title">URL Shortener</h1>
            <p>Turn long links into short, shareable URLs.</p>
          </div>
          <button
            className="history-toggle"
            type="button"
            aria-expanded={showHistory}
            aria-controls="history-panel"
            onClick={() => setShowHistory((visible) => !visible)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="history-icon"
            >
              <path
                d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            {showHistory ? "Hide history" : "History"}
          </button>
        </header>

        <form
          className="shorten-form"
          onSubmit={(event) => {
            event.preventDefault();
            handleShorten();
          }}
        >
          <label className="input-label" htmlFor="original-url">
            Paste your long URL
          </label>
          <input
            id="original-url"
            type="text"
            placeholder="https://example.com/your-long-link"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
            inputMode="url"
            autoComplete="url"
          />

          <button className="shorten-button" type="submit" disabled={loading}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {shortUrl && (
          <section className="result" aria-live="polite">
            <p className="result-label">Your shortened URL</p>
            <div className="short-url-row">
              <a
                className="short-url"
                href={shortUrl}
                target="_blank"
                rel="noreferrer"
              >
                {shortUrl}
              </a>
              <button
                className={`copy-button${copied ? " is-copied" : ""}`}
                type="button"
                onClick={handleCopy}
                aria-label={copied ? "URL copied" : "Copy URL"}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="copy-icon"
                >
                  {copied ? (
                    <path
                      d="m4.5 10.5 3.5 3.5 7.5-8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M7 6.5V4.8c0-.7.6-1.3 1.3-1.3h6.9c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3h-1.7M5.2 7h6.9c.7 0 1.3.6 1.3 1.3v8.4c0 .7-.6 1.3-1.3 1.3H5.2c-.7 0-1.3-.6-1.3-1.3V8.3c0-.7.6-1.3 1.3-1.3Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
            {copied && (
              <p className="copy-feedback" role="status">
                Link copied to clipboard.
              </p>
            )}
          </section>
        )}

        <div
          id="history-panel"
          className={`history-collapse${showHistory ? " is-open" : ""}`}
          aria-hidden={!showHistory}
        >
          <div className="history-collapse-inner" inert={!showHistory}>
            {historyLoading ? (
              <p className="history-status">Loading history...</p>
            ) : urlHistory.length === 0 ? (
              <p className="history-status">No shortened URLs yet.</p>
            ) : (
              <section className="history" aria-labelledby="history-heading">
                <div className="history-heading">
                  <h2 id="history-heading">Recent URLs</h2>
                  <span>{urlHistory.length} saved</span>
                </div>
                <div className="history-list">
                  {urlHistory.map((item, index) => {
                    const itemUrl = item.shortUrl.startsWith("http")
                      ? item.shortUrl
                      : `http://localhost:5001/api/${item.shortUrl}`;

                    return (
                      <article className="history-item" key={item._id || index}>
                        <p className="history-original">{item.originalUrl}</p>
                        <a
                          className="history-short-url"
                          href={itemUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {itemUrl}
                        </a>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </section>
      <footer className="page-footer">Short links, made simple.</footer>
    </main>
  );
}

export default App;
