import { useGameStore } from '@/stores/gameStore';

function App() {
  const { resources, addResource } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl mb-4">Space Salvage Empire</h1>
      <div className="mb-4">
        <p>Debris: {resources.debris}</p>
        <button
          onClick={() => addResource('debris', 1)}
          className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
        >
          Collect Debris
        </button>
      </div>
    </div>
  );
}

export default App;
