import React, { useState } from "react";

const formattaData = (str) => {
  const d = new Date(str);
  const giorno = String(d.getDate()).padStart(2, "0");
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const anno = d.getFullYear();
  return `${giorno}-${mese}-${anno}`;
};

export default function OptionChain({ chain = [], onSelect, prezzoSottostante = null }) {
  const [simulazioni, setSimulazioni] = useState({});
  const [scadenzeVisibili, setScadenzeVisibili] = useState([]);
  const [mostraFiltriScadenza, setMostraFiltriScadenza] = useState(false);
  const [rangeStrike, setRangeStrike] = useState(20);
  const [minVolume, setMinVolume] = useState(0);
  const [minOI, setMinOI] = useState(0);

  const perScadenza = chain.reduce((acc, opt) => {
    const key = opt.scadenza;
    acc[key] = acc[key] || [];
    acc[key].push(opt);
    return acc;
  }, {});

  const scadenzeDisponibili = Object.keys(perScadenza).sort();

  const aggiornaSimulazione = (scadenza, tipo, strike, valore) => {
    const chiave = `${scadenza}_${tipo}_${strike}`;
    setSimulazioni(prev => ({ ...prev, [chiave]: valore }));
  };

  const toggleScadenza = (scadenza) => {
    setScadenzeVisibili(prev =>
      prev.includes(scadenza)
        ? prev.filter(s => s !== scadenza)
        : [...prev, scadenza]
    );
  };

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">📜 Option Chain</h2>

      <div className="flex items-center gap-4 flex-wrap mb-4">
        <div className="relative">
          <button
            onClick={() => setMostraFiltriScadenza(prev => !prev)}
            className="bg-gray-100 border px-3 py-1 rounded text-sm shadow hover:bg-gray-200"
          >
            ⌛ Scadenze
          </button>
          {mostraFiltriScadenza && (
            <div className="absolute bg-white border shadow rounded p-3 mt-2 z-10 max-h-48 overflow-y-auto w-52">
              {scadenzeDisponibili.map(s => {
  const dataFormat = new Date(s).toISOString().slice(0, 10);
  return (
    <label key={formattaData(s)} className="block text-sm mb-1">
      <input
        type="checkbox"
        checked={scadenzeVisibili.includes(s)}
        onChange={() => toggleScadenza(s)}
        className="mr-2"
      />
      {dataFormat}
    </label>
  );
})}

            </div>
          )}
        </div>

        <label className="text-sm">
          ⚖️ Strike range:
          <input
            type="number"
            className="border ml-2 rounded px-2 py-1 w-16"
            value={rangeStrike}
            onChange={(e) => setRangeStrike(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          📈 Min Vol:
          <input
            type="number"
            className="border ml-2 rounded px-2 py-1 w-16"
            value={minVolume}
            onChange={(e) => setMinVolume(Number(e.target.value))}
          />
        </label>

        <label className="text-sm">
          📊 Min OI:
          <input
            type="number"
            className="border ml-2 rounded px-2 py-1 w-16"
            value={minOI}
            onChange={(e) => setMinOI(Number(e.target.value))}
          />
        </label>
      </div>

      {scadenzeDisponibili.filter(sc => scadenzeVisibili.includes(sc)).map(scadenza => {
        const opzioni = perScadenza[scadenza];
        const strikesTutte = Array.from(new Set(opzioni.map(o => o.strike))).sort((a, b) => a - b);
        const closest = prezzoSottostante != null
          ? strikesTutte.reduce((a, b) => Math.abs(b - prezzoSottostante) < Math.abs(a - prezzoSottostante) ? b : a)
          : null;

        const strikesFiltrate = strikesTutte.filter(k =>
          !closest || Math.abs(k - closest) <= rangeStrike
        );

        return (
          <div key={scadenza} className="mb-8">
           <h3 className="text-md font-bold text-gray-700 mb-2">
  Scadenza: {new Date(scadenza).toLocaleDateString("it-IT")}
</h3>


            <table className="w-full text-sm bg-white border rounded shadow overflow-hidden">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th colSpan={7} className="p-2">CALL</th>
                  <th className="bg-gray-50 p-2">Strike</th>
                  <th colSpan={7} className="p-2">PUT</th>
                </tr>
                <tr>
                  <th className="p-1">➕</th>
                  <th className="p-1">OI</th>
                  <th className="p-1">Vol</th>
                  <th className="p-1">Δ</th>
                  <th className="p-1">Bid</th>
                  <th className="p-1">Ask</th>
                  <th className="p-1">Last</th>
                  <th className="p-1">📥</th>
                  <th className="p-1 bg-gray-50"></th>
                  <th className="p-1">📥</th>
                  <th className="p-1">Last</th>
                  <th className="p-1">Ask</th>
                  <th className="p-1">Bid</th>
                  <th className="p-1">Δ</th>
                  <th className="p-1">Vol</th>
                  <th className="p-1">OI</th>
                  <th className="p-1">➕</th>
                </tr>
              </thead>
              <tbody>
                {strikesFiltrate.map(strike => {
                  const call = opzioni.find(o => o.tipo === "call" && o.strike === strike && o.volume >= minVolume && o.openInterest >= minOI);
                  const put = opzioni.find(o => o.tipo === "put" && o.strike === strike && o.volume >= minVolume && o.openInterest >= minOI);
                  const evidenzia = strike === closest ? "bg-yellow-100 font-bold" : "";
                  const kCall = `${scadenza}_call_${strike}`;
                  const kPut = `${scadenza}_put_${strike}`;
                  return (
                    <tr key={strike} className={`text-center even:bg-gray-50 ${evidenzia}`}>
                      <td>{call ? <button onClick={() => onSelect(call)} className="text-blue-600">➕</button> : "-"}</td>
                      <td>{call?.openInterest ?? "-"}</td>
                      <td>{call?.volume ?? "-"}</td>
                      <td>{call?.delta?.toFixed(2) ?? "-"}</td>
                      <td>{call?.bid?.toFixed(2) ?? "-"}</td>
                      <td>{call?.ask?.toFixed(2) ?? "-"}</td>
                      <td>{call?.lastPrice?.toFixed(2) ?? "-"}</td>
                      <td><input className="w-14 text-sm text-right border rounded px-1" value={simulazioni[kCall] ?? ""} onChange={e => aggiornaSimulazione(scadenza, "call", strike, e.target.value)} /></td>
                      <td className={`bg-gray-50 font-semibold`}>{strike}</td>
                      <td><input className="w-14 text-sm text-right border rounded px-1" value={simulazioni[kPut] ?? ""} onChange={e => aggiornaSimulazione(scadenza, "put", strike, e.target.value)} /></td>
                      <td>{put?.lastPrice?.toFixed(2) ?? "-"}</td>
                      <td>{put?.ask?.toFixed(2) ?? "-"}</td>
                      <td>{put?.bid?.toFixed(2) ?? "-"}</td>
                      <td>{put?.delta?.toFixed(2) ?? "-"}</td>
                      <td>{put?.volume ?? "-"}</td>
                      <td>{put?.openInterest ?? "-"}</td>
                      <td>{put ? <button onClick={() => onSelect(put)} className="text-blue-600">➕</button> : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
