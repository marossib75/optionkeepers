import { useEffect, useState } from "react";

export default function usePrezzoSottostante(ticker) {
  const [prezzo, setPrezzo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticker) return;

    const fetchPrezzo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/prezzo/${ticker}`);
        const json = await res.json();

        if (json.prezzo !== undefined && json.prezzo !== null) {
          setPrezzo(json.prezzo);
        } else {
          console.warn("Prezzo non trovato per", ticker);
          setPrezzo(null);
        }
      } catch (err) {
        console.error("Errore nel fetch del prezzo:", err);
        setPrezzo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrezzo();
  }, [ticker]);

  return { prezzo, loading };
}