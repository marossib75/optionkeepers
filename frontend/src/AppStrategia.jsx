import React, { useState, useEffect } from "react";
import StrategiaEditor from "./StrategiaEditor";
import usePrezzoSottostante from "./hooks/usePrezzoSottostante";

const AppStrategia = () => {
  const [strategie, setStrategie] = useState([
    {
      nome: "Strategia A",
      ticker: "AAPL",
      opzioni: [],
      prezzo: null
    }
  ]);

  const [attiva, setAttiva] = useState(0);

  const ticker = strategie[attiva]?.ticker;
  const { prezzo } = usePrezzoSottostante(ticker);

  useEffect(() => {
    if (prezzo && !isNaN(prezzo)) {
      const nuove = [...strategie];
      nuove[attiva].prezzo = prezzo;
      setStrategie(nuove);
    }
  }, [prezzo]);

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="mr-2 text-sm font-medium text-gray-700">Seleziona strategia:</label>
        <select
          value={attiva}
          onChange={(e) => setAttiva(Number(e.target.value))}
          className="border rounded px-2 py-1 text-sm"
        >
          {strategie.map((s, i) => (
            <option key={i} value={i}>{s.nome || `Strategia ${i + 1}`}</option>
          ))}
        </select>
      </div>
      <StrategiaEditor
        strategie={strategie}
        setStrategie={setStrategie}
        attiva={attiva}
        setAttiva={setAttiva}
      />
    </div>
  );
};

export default AppStrategia;