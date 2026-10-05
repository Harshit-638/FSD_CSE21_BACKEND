import { useEffect, useState } from "react";

function App() {

  
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  // Get Products
  const getProducts = async () => {

    const response = await fetch(
      "http://localhost:5000/api/products"
    );

    const data = await response.json();

    setProducts(data);
  };

  // Run when page loads
  useEffect(() => {
    getProducts();
  }, []);


  // Add Product
  const addProduct = async (e) => {

    e.preventDefault();

    const product = {
      name: name,
      price: price,
      category: category
    };

    await fetch("http://localhost:5000/api/products", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(product)
    });

    // Clear form
    setName("");
    setPrice("");
    setCategory("");

    // Get updated products
    getProducts();
  };


  // Delete Product
  const deleteProduct = async (id) => {

    await fetch(
      `http://localhost:5000/api/products/${id}`,
      {
        method: "DELETE"
      }
    );

    getProducts();
  };


  return (
    <div>

      <h1>Product Management System</h1>


      {/* Add Product Form */}

      <form onSubmit={addProduct}>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

        <button type="submit">
          Add Product
        </button>

      </form>


      <hr />


      {/* Product Table */}

      <table border="1" cellPadding="10">

        <thead>

          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Action</th>
          </tr>

        </thead>


        <tbody>

          {products.map((product) => (

            <tr key={product.id}>

              <td>{product.id}</td>

              <td>{product.name}</td>

              <td>₹{product.price}</td>

              <td>{product.category}</td>

              <td>

                <button
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;
