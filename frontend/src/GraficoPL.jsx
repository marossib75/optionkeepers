import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from "recharts";
import usePrezzoSottostante from "./hooks/usePrezzoSottostante";

function cumulativeNorm(x) {
  const a1 = 0.31938153, a2 = -0.356563782, a3 = 1.781477937,
        a4 = -1.821255978, a5 = 1.330274429, p = 0.2316419;
  const t = 1.0 / (1.0 + p * Math.abs(x));
  const b = 1.0 - (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-x * x / 2) *
    (a1 * t + a2 * t ** 2 + a3 * t ** 3 + a4 * t ** 4 + a5 * t ** 5);
  return x < 0 ? 1 - b : b;
}

function calcolaGreche(opzioni, spot, vol, giorni) {
  const S = spot;
  const T = Math.max(giorni / 365, 0.001);
  const sigma = vol / 100;
  let delta = 0, gamma = 0, vega = 0, theta = 0;
  const pdf = (x) => Math.exp(-0.5 * x ** 2) / Math.sqrt(2 * Math.PI);

  opzioni.forEach((opt) => {
    const K = opt.strike;
    const dir = opt.direzione === "buy" ? 1 : -1;
    const q = opt.quantita;
    const d1 = (Math.log(S / K) + 0.5 * sigma ** 2 * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    const Δ = opt.tipo === "call"
      ? cumulativeNorm(d1)
      : cumulativeNorm(d1) - 1;
    const Γ = pdf(d1) / (S * sigma * Math.sqrt(T));
    const Θ = (-S * pdf(d1) * sigma) / (2 * Math.sqrt(T)) / 365;
    const V = S * pdf(d1) * Math.sqrt(T) / 100;

    delta += dir * q * Δ;
    gamma += dir * q * Γ;
    vega += dir * q * V;
    theta += dir * q * Θ;
  });

  return {
    delta: delta.toFixed(2),
    gamma: gamma.toFixed(4),
    vega: vega.toFixed(2),
    theta: theta.toFixed(2),
  };
}

export default function GraficoPL({
  datiPL,
  strategie,
  attiva,
  giorniResidui,
  setGiorniResidui,
  volatilita,
  setVolatilita,
}) {
  const strategia = strategie[attiva];
  const spot = strategia.prezzo || 100;
  const greche = calcolaGreche(strategia.opzioni, spot, volatilita, giorniResidui);
  const { prezzo, loading } = usePrezzoSottostante(strategia.ticker);

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📉 Grafico P/L</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <label className="flex flex-col text-sm text-gray-700">
          Giorni a scadenza
          <input
            type="range"
            min="0"
            max="365"
            value={giorniResidui}
            onChange={(e) => setGiorniResidui(Number(e.target.value))}
            className="accent-blue-600"
          />
          <span className="text-xs text-gray-500 mt-1">{giorniResidui} giorni</span>
        </label>
        <label className="flex flex-col text-sm text-gray-700">
          Volatilità %
          <input
            type="range"
            min="5"
            max="100"
            step="1"
            value={volatilita}
            onChange={(e) => setVolatilita(Number(e.target.value))}
            className="accent-orange-500"
          />
          <span className="text-xs text-gray-500 mt-1">{volatilita}%</span>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={datiPL}>
          <XAxis dataKey="spot" type="number" domain={["auto", "auto"]} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip formatter={(value) => `${strategia.ticker?.match(/^[A-Z]+$/) ? '$' : '€'}${value.toFixed(2)}`} />
          <ReferenceLine y={0} stroke="#444" strokeDasharray="4 2" />
          <Line type="monotone" dataKey="scadenza" stroke="#1E40AF" strokeWidth={2} dot={false} name="A scadenza" />
          <Line type="monotone" dataKey="oggi" stroke="#F97316" strokeWidth={2} dot={false} name="Oggi" />
          {prezzo && (
            <ReferenceLine
              x={prezzo}
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="4 2"
              label={{ value: "Prezzo", position: "top", fill: "#2563eb" }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 text-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center shadow-sm">
        <div className="text-gray-700"><strong className="block text-xs text-gray-500 mb-1">Δ Delta</strong>{greche.delta}</div>
        <div className="text-gray-700"><strong className="block text-xs text-gray-500 mb-1">Γ Gamma</strong>{greche.gamma}</div>
        <div className="text-gray-700"><strong className="block text-xs text-gray-500 mb-1">Θ Theta</strong>{greche.theta}</div>
        <div className="text-gray-700"><strong className="block text-xs text-gray-500 mb-1">V Vega</strong>{greche.vega}</div>
      </div>
    </div>
  );
}