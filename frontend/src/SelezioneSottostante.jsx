import React from "react";

export default function SelezioneSottostante({ ticker, setTicker, prezzo, setPrezzo }) {
  return (
    <div className="mb-4 flex items-center gap-4 border p-3 rounded bg-gray-50">
      <div>
        <label className="mr-2 text-sm font-medium text-gray-700">Sottostante:</label>
        <input
          type="text"
          value={ticker || ""}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="border rounded px-2 py-1 text-sm w-32"
        />
      </div>

      <button
        onClick={() => alert("🔍 Ricerca sottostante in arrivo...")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm"
      >
        🔍
      </button>

      <div className="ml-6 text-sm">
        <span className="font-medium text-gray-700">Prezzo attuale:</span>
        <span className="ml-2 text-blue-700 font-semibold">
          {prezzo ? prezzo.toFixed(2) : "N/A"}
        </span>
      </div>
    </div>
  );
}
