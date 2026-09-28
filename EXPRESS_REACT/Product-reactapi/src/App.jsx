import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/products";
const emptyForm = { name: "", price: "", category: "", description: "" };

async function requestProducts(path = "", options) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "The request could not be completed.");
  }
  return result;
}

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshProducts = async () => {
    try {
      const result = await requestProducts();
      setProducts(result);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the product server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    requestProducts()
      .then((result) => {
        if (!active) return;
        setProducts(result);
        setLoading(false);
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.message || "Unable to reach the product server.");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await requestProducts(editingId === null ? "" : `/${editingId}`, {
        method: editingId === null ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, price: Number(form.price) }),
      });
      resetForm();
      await refreshProducts();
    } catch (requestError) {
      setError(requestError.message || "Unable to save this product.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: String(product.price),
      category: product.category,
      description: product.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    try {
      setError("");
      await requestProducts(`/${id}`, { method: "DELETE" });
      if (editingId === id) resetForm();
      await refreshProducts();
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this product.");
    }
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category} ${product.description || ""}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="brand" href="#dashboard" aria-label="Fieldnote inventory home">
          <span className="brand-mark">F</span>
          <span>fieldnote<span className="brand-dot">.</span></span>
        </a>
        <div className="topbar-meta"><span className="status-dot" /> Inventory workspace</div>
      </header>

      <div className="dashboard-content" id="dashboard">
        <section className="page-heading">
          <div>
            <p className="eyebrow">YOUR CATALOG</p>
            <h1>Products</h1>
            <p className="page-subtitle">A clear view of everything you have in stock.</p>
          </div>
          <div className="catalog-count"><strong>{products.length}</strong><span>total products</span></div>
        </section>

        {error && <div className="notice" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Dismiss error">Dismiss</button></div>}

        <section className="workspace-grid" aria-label="Product management">
          <aside className="form-panel">
            <div className="panel-heading">
              <div><p className="eyebrow">{editingId === null ? "CATALOG ENTRY" : `EDITING PRODUCT ${editingId}`}</p><h2>{editingId === null ? "Add a product" : "Update product"}</h2></div>
              {editingId !== null && <button className="text-button" type="button" onClick={resetForm}>Cancel</button>}
            </div>
            <form className="product-form" onSubmit={handleSubmit}>
              <label>Product name<input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Studio headphones" required maxLength={100} /></label>
              <div className="form-row">
                <label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="0.00" required /></label>
                <label>Category<input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Audio" required maxLength={60} /></label>
              </div>
              <label>Description <span className="optional-label">OPTIONAL</span><textarea name="description" value={form.description} onChange={handleChange} placeholder="A short note about this product" rows="3" maxLength={240} /></label>
              <button className="primary-button" type="submit" disabled={saving}>
                <span aria-hidden="true">{saving ? "..." : editingId === null ? "+" : "↻"}</span>
                {saving ? "Saving product" : editingId === null ? "Add product" : "Save changes"}
              </button>
            </form>
            <p className="form-footnote">Fields marked with * are required.</p>
          </aside>

          <section className="products-panel" aria-labelledby="products-title">
            <div className="list-heading">
              <div><p className="eyebrow">OVERVIEW</p><h2 id="products-title">Product list <span className="result-count">{filteredProducts.length}</span></h2></div>
              <label className="search-box"><span aria-hidden="true">⌕</span><input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search catalog" /></label>
            </div>
            {loading ? <div className="list-state" role="status"><span className="loader" />Loading your catalog...</div> : filteredProducts.length === 0 ? (
              <div className="list-state empty-state"><span className="empty-icon">◇</span><strong>{products.length === 0 ? "Your catalog is ready" : "No matching products"}</strong><span>{products.length === 0 ? "Add your first product using the form." : "Try another product name or category."}</span></div>
            ) : (
              <div className="table-wrap"><table>
                <thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>PRICE</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>{filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td><div className="product-name"><span className="product-avatar">{product.name.trim().charAt(0).toUpperCase()}</span><span><strong>{product.name}</strong><small>{product.description || `Product #${product.id}`}</small></span></div></td>
                    <td><span className="category-tag">{product.category}</span></td>
                    <td className="price-cell">₹{Number(product.price).toFixed(2)}</td>
                    <td><div className="row-actions"><button className="text-button" type="button" onClick={() => startEditing(product)}>Edit</button><button className="text-button danger-button" type="button" onClick={() => void deleteProduct(product.id)}>Delete</button></div></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </section>
        </section>
        <footer className="page-footer"><span>FIELDNOTE INVENTORY</span><span>Keep the details in good order.</span></footer>
      </div>
    </main>
  );
}

export default App;