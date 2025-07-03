import React, { useState } from "react";

function cumulativeNorm(x) {
  const a1 = 0.31938153, a2 = -0.356563782, a3 = 1.781477937,
        a4 = -1.821255978, a5 = 1.330274429, p = 0.2316419;
  const t = 1.0 / (1.0 + p * Math.abs(x));
  const b = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) *
    (a1 * t + a2 * t**2 + a3 * t**3 + a4 * t**4 + a5 * t**5);
  return x < 0 ? 1 - b : b;
}

function blackScholesCall(S, K, T, sigma) {
  const d1 = (Math.log(S / K) + (0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * cumulativeNorm(d1) - K * cumulativeNorm(d2);
}

function invertiIV(premioTarget, S, K, T) {
  let sigma = 0.2;
  for (let i = 0; i < 20; i++) {
    const prezzo = blackScholesCall(S, K, T, sigma);
    const vega = S * Math.exp(-0.5 * (((Math.log(S / K) + 0.5 * sigma ** 2) / (sigma * Math.sqrt(T))) ** 2)) / Math.sqrt(2 * Math.PI) * Math.sqrt(T);
    const diff = prezzo - premioTarget;
    if (Math.abs(diff) < 0.01) break;
    sigma = sigma - diff / vega;
    if (sigma <= 0) sigma = 0.01;
  }
  return sigma * 100;
}

export default function StrategiaEditor({ strategie, setStrategie, attiva }) {
  const strategia = strategie[attiva];
  const oggi = new Date();
  const [tab, setTab] = useState("attiva");

  const aggiornaOpzione = (index, campo, valore) => {
    const nuove = [...strategie];
    const opt = { ...nuove[attiva].opzioni[index], [campo]: valore };

    const S = nuove[attiva].prezzo || 100;
    const K = opt.strike;
    const giorni = (new Date(opt.scadenza) - oggi) / (1000 * 60 * 60 * 24);
    const T = Math.max(giorni / 365, 0.01);
    const sigma = (opt.iv || 20) / 100;

    if (campo === "prezzoSelezione") {
  if (valore === "MANUALE") {
    opt.premioCalcolato = opt.premioCalcolato || 0;
  } else if (valore === "TEORICO") {
    const S = strategie[attiva].prezzo || 100;
    const K = opt.strike;
    const giorni = (new Date(opt.scadenza) - oggi) / (1000 * 60 * 60 * 24);
    const T = Math.max(giorni / 365, 0.01);
    const sigma = (opt.iv || 20) / 100;
    opt.premioCalcolato = blackScholesCall(S, K, T, sigma);
  } else if (valore === "REALE") {
    const bid = opt.bid ?? 0;
    const ask = opt.ask ?? 0;
    const mid = (bid + ask) / 2;
    opt.premioCalcolato = isFinite(mid) && mid > 0 ? mid : 0;
  }
}
    if (campo === "iv") {
      const premio = blackScholesCall(S, K, T, valore / 100);
      opt.premio = Math.round(premio * 100) / 100;
    }

    if (campo === "premio") {
      const iv = invertiIV(valore, S, K, T);
      if (!isNaN(iv) && isFinite(iv) && iv > 0) {
        opt.iv = parseFloat(iv.toFixed(2));
      }
    }
if (campo === "premioCalcolato") {
  const iv = invertiIV(valore, S, K, T);
  if (!isNaN(iv) && isFinite(iv) && iv > 0) {
    opt.iv = parseFloat(iv.toFixed(2));
  }
}
    nuove[attiva].opzioni[index] = opt;
    setStrategie(nuove);
  };


  const aggiungiOpzione = () => {
    const nuove = [...strategie];
    nuove[attiva].opzioni.push({
      tipo: "call",
      strike: 100,
      premio: 5,
      iv: 20,
      quantita: 1,
      scadenza: "2024-12-31",
      direzione: "buy",
      attiva: true,
      premioCalcolato: 0,
      prezzoSelezione: "MANUALE"
    });
    setStrategie(nuove);
  };

  const rimuoviOpzione = (index) => {
    const nuove = [...strategie];
    nuove[attiva].opzioni.splice(index, 1);
    setStrategie(nuove);
  };

  return (
    <div className="my-6">
      <div className="flex gap-4 border-b mb-4">
        <button
          className={`px-4 py-2 ${tab === "attiva" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setTab("attiva")}
        >
          🧮 Strategia Attiva
        </button>
        <button
          className={`px-4 py-2 ${tab === "storico" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
          onClick={() => setTab("storico")}
        >
          📜 Storico Ordini
        </button>
      </div>

      {tab === "attiva" && (
        <>
          <h2 className="text-lg font-semibold mb-2">📋 Opzioni</h2>
          <table className="w-full text-sm mb-4 bg-white shadow rounded overflow-hidden">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-2">Attiva</th>
                <th className="p-2">Tipo</th>
                <th className="p-2">Strike</th>
                <th className="p-2">Scadenza</th>
                <th className="p-2">Prezzo</th>
                <th className="p-2">Quantità</th>
                <th className="p-2">IV</th>
                <th className="p-2">Azioni</th>
                <th className="p-2">✕</th>
              </tr>
            </thead>
            <tbody>
              {strategia.opzioni.map((opt, i) => {
                return (
                  <tr key={i} className="text-center even:bg-gray-50">
                    <td><input type="checkbox" checked={opt.attiva} onChange={(e) => aggiornaOpzione(i, "attiva", e.target.checked)} /></td>
                    <td>
                      <select value={opt.tipo} onChange={(e) => aggiornaOpzione(i, "tipo", e.target.value)}>
                        <option value="call">Call</option>
                        <option value="put">Put</option>
                      </select>
                    </td>
                    <td><input type="number" value={opt.strike} onChange={(e) => aggiornaOpzione(i, "strike", Number(e.target.value))} className="text-right w-20" /></td>
                    <td><input type="date" value={opt.scadenza} onChange={(e) => aggiornaOpzione(i, "scadenza", e.target.value)} /></td>
                    <td>
                      <select
  value={opt.prezzoSelezione}
  onChange={(e) => aggiornaOpzione(i, "prezzoSelezione", e.target.value)}
>
  <option value="TEORICO">Teorico MID</option>
  <option value="REALE">Reale</option>
  <option value="MANUALE">Manuale</option>
</select>

                      <input type="number" value={opt.premioCalcolato || ""} onChange={(e) => aggiornaOpzione(i, "premioCalcolato", Number(e.target.value))} className="text-right w-20" />
                    </td>
                    <td><input type="number" value={opt.quantita} onChange={(e) => aggiornaOpzione(i, "quantita", Number(e.target.value))} className="text-right w-16" /></td>
                    <td><input type="number" value={opt.iv} onChange={(e) => aggiornaOpzione(i, "iv", Number(e.target.value))} className="text-right w-16" /></td>
                    <td>
                      <button className="text-blue-600 mr-2">Open</button>
                      <button className="text-red-600">Close</button>
                    </td>
                    <td><button onClick={() => rimuoviOpzione(i)} className="text-red-600 font-bold">✕</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button onClick={aggiungiOpzione} className="bg-green-600 text-white px-3 py-1 rounded">+ Aggiungi Opzione</button>
        </>
      )}

      {tab === "storico" && (
        <div>
          <h3 className="text-md font-semibold mt-4 mb-2">📜 Storico ordini</h3>
          <p>⚠️ Lo storico non è ancora implementato in questa versione aggiornata.</p>
        </div>
      )}
    </div>
  );
}
