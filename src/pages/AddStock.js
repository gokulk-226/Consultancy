import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStock.css';

function AddStock() {
    const [formData, setFormData] = useState({
        productName: '', 
        manufacturer: '', 
        quantity: 0, 
        date: '', 
        amount: 0,
        totalAmount: 0
    });
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };
            if (name === "quantity" || name === "amount") {
                updatedData.totalAmount = updatedData.quantity * updatedData.amount;
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { productName, manufacturer, quantity, date, amount } = formData;
            const requestData = { productName, manufacturer, quantity: Number(quantity), date, amount: Number(amount) };
    
            if (editingId) {
                await axios.put(`http://localhost:5000/api/products/edit/${editingId}`, requestData);
                alert('Stock updated successfully!');
            } else {
                await axios.post('http://localhost:5000/api/products/add', requestData);
                alert('Stock added successfully!');
            }
    
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error("Error adding/updating stock:", error);
        }
    };
    
    const handleEdit = (product) => {
        setFormData({ ...product, totalAmount: product.quantity * product.amount });
        setEditingId(product._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
                alert("Product deleted successfully!");
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ productName: '', manufacturer: '', quantity: 0, date: '', amount: 0, totalAmount: 0 });
        setEditingId(null);
    };

    return (
        <div className="container">
            <h2>{editingId ? "Edit Stock" : "Add Stock"}</h2>
            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {['productName', 'manufacturer', 'quantity', 'date', 'amount'].map((field, index) => (
                        <input 
                            key={index} 
                            type={field === 'date' ? 'date' : field === 'quantity' || field === 'amount' ? 'number' : 'text'}
                            name={field}
                            placeholder={field.replace(/([A-Z])/g, ' $1').trim()}
                            value={formData[field]}
                            onChange={handleChange}
                            required
                        />
                    ))}
                    <input type="number" name="totalAmount" placeholder="Total Amount" value={formData.totalAmount} readOnly />
                    <button type="submit">{editingId ? 'Update Stock' : 'Add Stock'}</button>
                </form>
            </div>
            <div className="products-container">
                <h3>Stored Products</h3>
                <table>
                    <thead>
                        <tr>
                            {['Product Name', 'Manufacturer', 'Quantity', 'Date', 'Amount', 'Total Amount', 'Actions'].map((heading, index) => (
                                <th key={index}>{heading}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product) => (
                                <tr key={product._id}>
                                    {['productName', 'manufacturer', 'quantity', 'date', 'amount'].map((field, index) => (
                                        <td key={index}>{field === 'amount' ? `₹${product[field]}` : product[field]}</td>
                                    ))}
                                    <td>₹{product.quantity * product.amount}</td>
                                    <td>
                                        <button onClick={() => handleEdit(product)}>Edit</button>
                                        <button onClick={() => handleDelete(product._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7">No stock available.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AddStock;