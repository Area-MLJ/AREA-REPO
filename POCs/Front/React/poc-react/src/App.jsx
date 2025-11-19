import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const product = { name: "Product", price: 99 };

  return (
    <div className="card">
      <h2>{product.name}</h2>
      <p>Price : {product.price} €</p>
      
      <div className="quantity">
        Quantity : {count}
      </div>
      
      <button onClick={() => setCount(count + 1)}>Add to Cart (+)</button>
      <button className="secondary" onClick={() => setCount(0)}>Empty</button>
      
      <hr />
      
      <button className="secondary" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? "Masquer détails" : "Voir détails"}
      </button>

      {showDetails && (
        <div className="details">
          <p>This product offers active noise cancellation and 20 hours of battery life.</p>
        </div>
      )}
    </div>
  )
}

export default App