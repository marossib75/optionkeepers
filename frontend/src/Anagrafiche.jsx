// src/Anagrafiche.jsx

export default function Anagrafiche({ setPagina }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📘 Anagrafiche</h2>
      <p className="text-gray-600">Qui potrai gestire le anagrafiche degli strumenti: ticker, moltiplicatore e altri dati.</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setPagina("strategie")}
      >
        Torna alle strategie
      </button>
    </div>
  );
}
