import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Anagrafiche from "./Anagrafiche";
import GraficoPL from "./GraficoPL";
import StrategiaEditor from "./StrategiaEditor";
import SelezioneSottostante from "./SelezioneSottostante";
import usePrezzoSottostante from "./hooks/usePrezzoSottostante";
import OptionChain from "./OptionChain";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Funzione per il calcolo della distribuzione normale cumulativa
function cumulativeNorm(x) {
  const a1 = 0.31938153, a2 = -0.356563782, a3 = 1.781477937,
        a4 = -1.821255978, a5 = 1.330274429, p = 0.2316419;
  const t = 1.0 / (1.0 + p * Math.abs(x));
  const b = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) *
    (a1 * t + a2 * t**2 + a3 * t**3 + a4 * t**4 + a5 * t**5);
  return x < 0 ? 1 - b : b;
}

export default function App() {
  const [pagina, setPagina] = useState("strategie");
  const [strategie, setStrategie] = useState(() => {
    const salvate = localStorage.getItem("strategie");
    return salvate ? JSON.parse(salvate) : [{
      nome: "Bull Call Spread AAPL",
      ticker: "AAPL",
      opzioni: [
        { tipo: "call", strike: 145, premio: 8, quantita: 1, scadenza: "2024-07-19", direzione: "buy" },
        { tipo: "call", strike: 155, premio: 3, quantita: 1, scadenza: "2024-07-19", direzione: "sell" },
      ]
    }];
  });
  const [attiva, setAttiva] = useState(0);
  const { prezzo: prezzoSottostante } = usePrezzoSottostante(strategie[attiva]?.ticker);
  const [volatilita, setVolatilita] = useState(20);
  const [giorniResidui, setGiorniResidui] = useState(365);
  const [optionChain, setOptionChain] = useState([]);
  const [datiPL, setDatiPL] = useState([]);

  useEffect(() => {
    localStorage.setItem("strategie", JSON.stringify(strategie));
    calcolaPL();
  }, [strategie, attiva, volatilita, giorniResidui]);

  useEffect(() => {
    const ticker = strategie[attiva]?.ticker;
    if (!ticker) return;

    const fetchChain = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/option-chain/${ticker}`);
        const json = await res.json();
        setOptionChain(json.chain || []);
      } catch (err) {
        console.error("Errore fetch option chain:", err);
        setOptionChain([]);
      }
    };

    fetchChain();
  }, [strategie[attiva]?.ticker]);

  useEffect(() => {
    if (!strategie[attiva]) return;
    const nuove = [...strategie];
    nuove[attiva].prezzo = prezzoSottostante;
    setStrategie(nuove);
  }, [prezzoSottostante]);

  function calcolaPL() {
    if (!strategie[attiva] || !Array.isArray(strategie[attiva].opzioni)) return;
    const opts = strategie[attiva].opzioni;
    const strikes = opts.map(o => o.strike);
    const prezzoCentrale = strikes.reduce((a, b) => a + b, 0) / strikes.length;
    const range = prezzoCentrale * 0.2;
    const sMin = Math.floor(prezzoCentrale - range);
    const sMax = Math.ceil(prezzoCentrale + range);

    const lista = [];
    for (let s = sMin; s <= sMax; s++) {
      let plScadenza = 0, plOggi = 0;
      opts.forEach(opt => {
        const { tipo, strike, premio, quantita, direzione } = opt;
        const dir = direzione === "buy" ? 1 : -1;
        const payoff = tipo === "call" ? Math.max(s - strike, 0) : Math.max(strike - s, 0);
        const T = Math.max(0.001, giorniResidui / 365);
        const d1 = (Math.log(s / strike) + 0.5 * (volatilita / 100) ** 2 * T) / ((volatilita / 100) * Math.sqrt(T));
        const d2 = d1 - (volatilita / 100) * Math.sqrt(T);
        const prezzoBS = tipo === "call"
          ? s * cumulativeNorm(d1) - strike * cumulativeNorm(d2)
          : strike * cumulativeNorm(-d2) - s * cumulativeNorm(-d1);
        plScadenza += dir * quantita * (payoff - premio);
        plOggi += dir * quantita * (prezzoBS - premio);
      });
      lista.push({ spot: s, oggi: plOggi, scadenza: plScadenza });
    }
    setDatiPL(lista);
  }

  return (
    <>
      <ToastContainer />
      <div className="absolute top-4 right-6">
        <button
          onClick={() => {
            const nuova = {
              nome: `Strategia ${strategie.length + 1}`,
              ticker: "",
              opzioni: [],
            };
            const aggiornate = [...strategie, nuova];
            setStrategie(aggiornate);
            setAttiva(aggiornate.length - 1);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          + Nuova Strategia
        </button>
      </div>

      <div className="flex min-h-screen">
        <Sidebar pagina={pagina} setPagina={setPagina} />
        <main className="flex-1 p-6">
          {pagina === "strategie" ? (
            <>
              <div className="flex items-center gap-4 mb-4">
                <SelezioneSottostante
                  ticker={strategie[attiva].ticker || ""}
                  setTicker={(val) => {
                    const nuove = [...strategie];
                    nuove[attiva].ticker = val;
                    setStrategie(nuove);
                  }}
                  prezzo={strategie[attiva].prezzo}
                  setPrezzo={(val) => {
                    const nuove = [...strategie];
                    nuove[attiva].prezzo = val;
                    setStrategie(nuove);
                  }}
                />

                <select
                  value={attiva}
                  onChange={(e) => setAttiva(Number(e.target.value))}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {strategie.map((s, i) => (
                    <option key={i} value={i}>
                      {s.nome || `Strategia ${i + 1}`}
                    </option>
                  ))}
                </select>
                <h1 className="text-xl font-bold text-gray-800">📈 Le mie strategie</h1>
                <input
                  type="text"
                  value={strategie[attiva].nome}
                  onChange={(e) => {
                    const nuove = [...strategie];
                    nuove[attiva].nome = e.target.value;
                    setStrategie(nuove);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                />
              </div>

              <GraficoPL
                datiPL={datiPL}
                strategie={strategie}
                attiva={attiva}
                giorniResidui={giorniResidui}
                setGiorniResidui={setGiorniResidui}
                volatilita={volatilita}
                setVolatilita={setVolatilita}
              />
              <StrategiaEditor
                strategie={strategie}
                setStrategie={setStrategie}
                attiva={attiva}
                setAttiva={setAttiva}
              />
              <OptionChain
                chain={optionChain}
                prezzoSottostante={prezzoSottostante}
                onSelect={(opt) => {
                  const nuove = [...strategie];
                  const nuovaOpz = {
                    ...opt,
                    bid: opt.bid ?? 0, 
                    ask: opt.ask ?? 0,
                    premio: ((opt.bid ?? 0) + (opt.ask ?? 0)) / 2,
                    premioCalcolato: ((opt.bid ?? 0) + (opt.ask ?? 0)) / 2,
                    quantita: 1,
                    attiva: true,
                    prezzoSelezione: "REALE"
                  };
                  nuove[attiva].opzioni.push(nuovaOpz);
                  setStrategie(nuove);
                }}
              />
            </>
          ) : pagina === "anagrafiche" ? (
            <Anagrafiche setPagina={setPagina} />
          ) : null}
        </main>
      </div>
    </>
  );
}
