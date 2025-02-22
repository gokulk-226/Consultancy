import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStock.css';

function GenerateBill() {
    const [formData, setFormData] = useState({
        productName: '',
        quantity: 0,
        amount: 0,
        totalAmount: 0
    });

    const [bills, setBills] = useState([]);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchBills();
        fetchProducts();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/bills');
            setBills(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error("Error fetching bills:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleProductSelect = (e) => {
        const selectedProduct = products.find(product => product.productName === e.target.value);
        if (selectedProduct) {
            setFormData({
                ...formData,
                productName: selectedProduct.productName,
                amount: selectedProduct.amount, // Auto-fill price
                totalAmount: formData.quantity * selectedProduct.amount
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updatedFormData = { ...formData, [name]: value };

        if (name === "quantity" || name === "amount") {
            updatedFormData.totalAmount = updatedFormData.quantity * updatedFormData.amount;
        }

        setFormData(updatedFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/bills/generate', formData);
            alert(response.data.message);
            fetchBills();
        } catch (error) {
            alert("Error generating bill");
        }
    };

    return (
        <div className="container">
            <h2>Generate Bill</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Product Selection Dropdown */}
                    <select name="productName" onChange={handleProductSelect} required>
                        <option value="">Select Product</option>
                        {products.map(product => (
                            <option key={product._id} value={product.productName}>
                                {product.productName}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        readOnly
                        className="readonly-input"
                    />
                    <input
                        type="text"
                        name="totalAmount"
                        value={`Total Amount: ₹${formData.totalAmount}`}
                        readOnly
                        className="readonly-input"
                    />
                    <button type="submit" className="submit-btn">Generate Bill</button>
                </form>
            </div>

            <div className="products-container">
                <h3>All Bills</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Amount (₹)</th>
                                <th className="total-amount-column">Total Amount (₹)</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill._id}>
                                    <td>{bill.productName}</td>
                                    <td>{bill.quantity}</td>
                                    <td>₹{bill.amount}</td>
                                    <td className="total-amount-column">₹{bill.quantity * bill.amount}</td>
                                    <td>{new Date(bill.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default GenerateBill;
