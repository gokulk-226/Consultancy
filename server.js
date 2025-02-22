const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/inventoryDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

const ProductSchema = new mongoose.Schema({
    productName: String,
    manufacturer: String,
    quantity: Number,
    date: String,
    amount: Number
});
const Product = mongoose.model('Product', ProductSchema);

const BillSchema = new mongoose.Schema({
    productName: String,
    quantity: Number,
    amount: Number,
    totalAmount: Number,
    date: { type: Date, default: Date.now }
});
const Bill = mongoose.model('Bill', BillSchema);

// 🟢 Add or Update Stock
app.post('/api/products/add', async (req, res) => {
    try {
        const { productName, manufacturer, quantity, date, amount } = req.body;
        const existingProduct = await Product.findOne({ productName });

        if (existingProduct) {
            existingProduct.quantity += parseInt(quantity);
            await existingProduct.save();
        } else {
            const newProduct = new Product({ productName, manufacturer, quantity, date, amount });
            await newProduct.save();
        }

        res.status(201).json({ message: "✅ Stock Added Successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error Adding Stock" });
    }
});

// 🟢 Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ date: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "❌ Error Fetching Products" });
    }
});

// 🟢 Update Product (Fixed Route)
app.put('/api/products/edit/:id', async (req, res) => {
    try {
        const { productName, manufacturer, quantity, date, amount } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { productName, manufacturer, quantity, date, amount },
            { new: true } // Ensures the updated product is returned
        );

        if (!updatedProduct) {
            return res.status(404).json({ error: "❌ Product Not Found" });
        }

        res.json({ message: "✅ Product Updated Successfully!", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: "❌ Error Updating Product" });
    }
});

// 🟢 Delete Product
app.delete('/api/products/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "✅ Product Deleted Successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error Deleting Product" });
    }
});

// 🟢 Generate Bill & Reduce Stock
app.post('/api/bills/generate', async (req, res) => {
    try {
        const { productName, quantity, amount } = req.body;
        const product = await Product.findOne({ productName });

        if (!product) {
            return res.status(404).json({ error: "❌ Product Not Found" });
        }

        if (product.quantity < quantity) {
            return res.status(400).json({ error: "❌ Insufficient Stock" });
        }

        product.quantity -= quantity;
        await product.save();

        const totalAmount = quantity * amount;
        const newBill = new Bill({ productName, quantity, amount, totalAmount });
        await newBill.save();

        res.json({ message: "✅ Bill Generated Successfully!" });
    } catch (error) {
        res.status(500).json({ error: "❌ Error Generating Bill" });
    }
});

// 🟢 Get All Bills
app.get('/api/bills', async (req, res) => {
    try {
        const bills = await Bill.find().sort({ date: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: "❌ Error Fetching Bills" });
    }
});

// 🟢 Get Low Stock Products (<100)
app.get('/api/products/low-stock', async (req, res) => {
    try {
        const lowStockProducts = await Product.find({ quantity: { $lt: 100 } });
        res.json(lowStockProducts);
    } catch (error) {
        res.status(500).json({ error: "❌ Error Fetching Low Stock Data" });
    }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
