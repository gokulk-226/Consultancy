import { useState, useEffect } from 'react';
import axios from 'axios';

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
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Generate Bill</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="productName" placeholder="Product Name" onChange={handleChange} required className="w-full p-2 border rounded-md" />
                <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required className="w-full p-2 border rounded-md" />
                <input type="number" name="amount" placeholder="Amount (₹)" onChange={handleChange} required className="w-full p-2 border rounded-md" />
                <input type="text" name="totalAmount" value={`Total Amount: ₹${formData.totalAmount}`} readOnly className="w-full p-2 border rounded-md bg-gray-100" />
                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">Generate Bill</button>
            </form>

            <h3 className="text-xl font-semibold mt-6">All Bills</h3>
            <table className="w-full mt-4 border-collapse border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">Product Name</th>
                        <th className="border border-gray-300 p-2">Quantity</th>
                        <th className="border border-gray-300 p-2">Amount (₹)</th>
                        <th className="border border-gray-300 p-2">Total Amount (₹)</th>
                        <th className="border border-gray-300 p-2">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.map((bill) => (
                        <tr key={bill._id} className="hover:bg-gray-100">
                            <td className="border border-gray-300 p-2">{bill.productName}</td>
                            <td className="border border-gray-300 p-2">{bill.quantity}</td>
                            <td className="border border-gray-300 p-2">₹{bill.amount}</td>
                            <td className="border border-gray-300 p-2">₹{bill.quantity * bill.amount}</td>
                            <td className="border border-gray-300 p-2">{new Date(bill.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default GenerateBill;
