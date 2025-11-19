import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const product = { name: "Product", price: 99 };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6 max-w-xs w-full text-center">
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-4">Price : <span className="font-semibold">{product.price} €</span></p>
        
        <div className="text-2xl font-bold text-blue-600 my-4">
          Quantity : {count}
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
          >
            Add to cart (+)
          </button>
          
          <button 
            onClick={() => setCount(0)}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition"
          >
            Empty
          </button>
        </div>
        
        <hr className="my-4" />
        
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-500 underline hover:text-blue-700 text-sm"
        >
          {showDetails ? "Hide details" : "Show details"}
        </button>

        {showDetails && (
          <div className="mt-4 p-3 bg-gray-100 rounded text-left text-sm text-gray-700">
            <p>This product offers active noise reduction and 20h of battery life.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App