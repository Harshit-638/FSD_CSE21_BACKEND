import cors from "cors";
import express from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const app = express();
const port = 5000;
const productsFile = fileURLToPath(new URL("./products.json", import.meta.url));

app.use(cors());
app.use(express.json());

function readProducts() {
  const products = JSON.parse(readFileSync(productsFile, "utf8"));
  if (!Array.isArray(products)) {
    throw new Error("Product data must be a JSON array");
  }
  return products;
}

function writeProducts(products) {
  writeFileSync(productsFile, `${JSON.stringify(products, null, 2)}\n`);
}

function validateProduct(product) {
  return (
    typeof product?.name === "string" &&
    product.name.trim().length > 0 &&
    typeof product?.category === "string" &&
    product.category.trim().length > 0 &&
    product.price !== "" &&
    Number.isFinite(Number(product.price)) &&
    Number(product.price) >= 0
  );
}

function findProductIndex(products, id) {
  const numericId = Number(id);
  return Number.isSafeInteger(numericId)
    ? products.findIndex((product) => product.id === numericId)
    : -1;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/products", (_req, res) => {
  res.json(readProducts());
});

app.get("/api/products/:id", (req, res) => {
  const products = readProducts();
  const productIndex = findProductIndex(products, req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json(products[productIndex]);
});

app.post("/api/products", (req, res) => {
  if (!validateProduct(req.body)) {
    return res.status(400).json({
      message: "Name, category, and a non-negative price are required",
    });
  }

  const products = readProducts();
  const nextId = products.reduce(
    (maximum, product) => Math.max(maximum, Number(product.id) || 0),
    0,
  ) + 1;
  const newProduct = {
    id: nextId,
    name: req.body.name.trim(),
    price: Number(req.body.price),
    category: req.body.category.trim(),
    description: typeof req.body.description === "string" ? req.body.description.trim() : "",
  };

  products.push(newProduct);
  writeProducts(products);
  return res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const products = readProducts();
  const productIndex = findProductIndex(products, req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (!validateProduct(req.body)) {
    return res.status(400).json({
      message: "Name, category, and a non-negative price are required",
    });
  }

  products[productIndex] = {
    ...products[productIndex],
    name: req.body.name.trim(),
    price: Number(req.body.price),
    category: req.body.category.trim(),
    description: typeof req.body.description === "string" ? req.body.description.trim() : "",
  };
  writeProducts(products);
  return res.json(products[productIndex]);
});

app.delete("/api/products/:id", (req, res) => {
  const products = readProducts();
  const productIndex = findProductIndex(products, req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const [deletedProduct] = products.splice(productIndex, 1);
  writeProducts(products);
  return res.json({ message: "Product deleted successfully", product: deletedProduct });
});

app.use((error, _req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON" });
  }
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});