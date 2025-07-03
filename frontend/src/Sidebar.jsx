export default function Sidebar({ pagina, setPagina }) {
  return (
    <aside className="w-64 bg-white shadow-md p-4 border-r">
      <h2 className="text-lg font-bold mb-4">📂 Menu</h2>
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => setPagina("strategie")}
            className={`w-full text-left px-3 py-1 rounded hover:bg-gray-100 ${pagina === "strategie" ? "bg-gray-100 font-semibold" : ""}`}
          >
            📈 Le mie strategie
          </button>
        </li>
        <li>
          <button
            onClick={() => setPagina("anagrafiche")}
            className={`w-full text-left px-3 py-1 rounded hover:bg-gray-100 ${pagina === "anagrafiche" ? "bg-gray-100 font-semibold" : ""}`}
          >
            📘 Anagrafiche
          </button>
        </li>
      </ul>
    </aside>
  );
}