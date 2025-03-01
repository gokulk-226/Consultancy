const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/inventoryDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log(" MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Product Schema
const ProductSchema = new mongoose.Schema({
    productName: String,
    manufacturer: String,
    quantity: Number,
    date: { type: Date, default: Date.now },
    amount: Number,
    totalAmount: Number
});
const Product = mongoose.model('Product', ProductSchema);

// Bill Schema
const BillSchema = new mongoose.Schema({
    productName: String,
    manufacturer: String,
    quantity: Number,
    amount: Number,
    totalAmount: Number,
    date: { type: Date, default: Date.now }
});
const Bill = mongoose.model('Bill', BillSchema);

// Purchase Schema
const PurchaseSchema = new mongoose.Schema({
    productName: String,
    manufacturer: String,
    quantity: Number,
    date: { type: Date, default: Date.now },
    amount: Number,
    totalAmount: Number
});
const Purchase = mongoose.model('Purchase', PurchaseSchema);

// Add Stock (Always Creates a New Entry)
app.post('/api/products/add', async (req, res) => {
    try {
        const { productName, manufacturer, quantity, date, amount } = req.body;
        const totalAmount = quantity * amount;
        
        const newProduct = new Product({ productName, manufacturer, quantity, date, amount, totalAmount });
        await newProduct.save();
        
        const newPurchase = new Purchase({ productName, manufacturer, quantity, date, amount, totalAmount });
        await newPurchase.save();

        res.status(201).json({ message: "Stock Added Successfully!" });
    } catch (error) {
        console.error("Error Adding Stock:", error);
        res.status(500).json({ error: "Error Adding Stock" });
    }
});

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (error) {
        console.error("Error Fetching Products:", error);
        res.status(500).json({ error: "Error Fetching Products" });
    }
});

// Get All Purchases
app.get('/api/purchases', async (req, res) => {
    try {
        const purchases = await Purchase.find().sort({ date: -1 });
        res.json(purchases);
    } catch (error) {
        console.error("Error Fetching Purchases:", error);
        res.status(500).json({ error: "Error Fetching Purchases" });
    }
});

// Update Product
app.put('/api/products/edit/:id', async (req, res) => {
    try {
        const { productName, manufacturer, quantity, date, amount } = req.body;
        const totalAmount = quantity * amount;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { productName, manufacturer, quantity, date, amount, totalAmount },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "Product Not Found" });
        }

        res.json({ message: "Product Updated Successfully!", product: updatedProduct });
    } catch (error) {
        console.error("Error Updating Product:", error);
        res.status(500).json({ error: "Error Updating Product" });
    }
});

// Delete Product
app.delete('/api/products/delete/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product Not Found" });
        }
        res.json({ message: "Product Deleted Successfully!" });
    } catch (error) {
        console.error("Error Deleting Product:", error);
        res.status(500).json({ error: "Error Deleting Product" });
    }
});

// Generate Bill & Reduce Stock
app.post('/api/bills/generate', async (req, res) => {
    try {
        const { productName, manufacturer, quantity, amount } = req.body;
        const totalAmount = quantity * amount;
        
        const product = await Product.findOne({ productName, manufacturer });
        if (!product || product.quantity < quantity) {
            return res.status(400).json({ error: "Insufficient Stock or Product Not Found" });
        }
        
        product.quantity -= quantity;
        product.totalAmount = product.quantity * product.amount;
        await product.save();

        const newBill = new Bill({ productName, manufacturer, quantity, amount, totalAmount });
        await newBill.save();

        res.json({ message: "Bill Generated Successfully!" });
    } catch (error) {
        console.error("Error Generating Bill:", error);
        res.status(500).json({ error: "Error Generating Bill" });
    }
});

//  Get All Bills
app.get('/api/bills', async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 });
        res.json(bills);
    } catch (error) {
        console.error("Error Fetching Bills:", error);
        res.status(500).json({ error: "Error Fetching Bills" });
    }
});

// Get Low Stock Products (<100)
app.get('/api/products/low-stock', async (req, res) => {
    try {
        const products = await Product.find();
        const productMap = new Map();

        products.forEach(({ productName, quantity }) => {
            if (productMap.has(productName)) {
                productMap.set(productName, productMap.get(productName) + quantity);
            } else {
                productMap.set(productName, quantity);
            }
        });

        const lowStockProducts = Array.from(productMap)
            .filter(([_, totalQuantity]) => totalQuantity < 100)
            .map(([productName, totalQuantity]) => ({ productName, quantity: totalQuantity }));

        res.json(lowStockProducts);
    } catch (error) {
        console.error("Error Fetching Low Stock Data:", error);
        res.status(500).json({ error: "Error Fetching Low Stock Data" });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));