import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStock.css';

function GenerateBill() {
    const [formData, setFormData] = useState({ productName: '', quantity: 0, amount: 0, totalAmount: 0 });
    const [bills, setBills] = useState([]);

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/bills');
            setBills(response.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) {
            console.error("Error fetching bills:", error);
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
        <div className="products-container">
            <h2>Generate Bill</h2>
            
            <form onSubmit={handleSubmit} className="form-container">
                <input type="text" name="productName" placeholder="Product Name" onChange={handleChange} required />
                <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required />
                <input type="number" name="amount" placeholder="Amount (₹)" onChange={handleChange} required />
                <input type="text" name="totalAmount" value={`Total Amount: ₹${formData.totalAmount}`} readOnly className="readonly-input" />
                <button type="submit" className="submit-btn">Generate Bill</button>
            </form>

            <h3>All Bills</h3>
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
    );
}

export default GenerateBill;