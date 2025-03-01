import { useState, useEffect } from 'react';
import axios from 'axios';
import './AddStock.css';

function GenerateBill() {
    const [formData, setFormData] = useState({
        productName: '',
        manufacturer: '',
        quantity: '',
        amount: 0,
        totalAmount: 0
    });

    const [bills, setBills] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

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

    const handleProductSearch = (e) => {
        const value = e.target.value;
        setFormData((prevState) => ({
            ...prevState,
            productName: value
        }));

        if (value.length > 0) {
            const filtered = products.filter((product) =>
                product.productName.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredProducts(filtered);
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleProductSelect = (product) => {
        setFormData({
            ...formData,
            productName: product.productName,
            manufacturer: product.manufacturer,
            amount: product.amount,
            totalAmount: formData.quantity * product.amount
        });
        setShowDropdown(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let numericValue = name === "quantity" ? value.replace(/^0+/, '') : value;

        if (name === "quantity" || name === "amount") {
            numericValue = Number(numericValue) || '';
        }

        setFormData(prevState => {
            const updatedFormData = { ...prevState, [name]: numericValue };
            if (name === "quantity" || name === "amount") {
                updatedFormData.totalAmount = (updatedFormData.quantity || 0) * (updatedFormData.amount || 0);
            }
            return updatedFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.productName) {
            alert("Please select a product.");
            return;
        }

        if (formData.quantity <= 0) {
            alert("Quantity must be greater than zero.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/bills/generate', formData);
            alert(response.data.message);
            fetchBills();

            setFormData({
                productName: '',
                manufacturer: '',
                quantity: '',
                amount: 0,
                totalAmount: 0
            });
        } catch (error) {
            alert("Error generating bill");
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h2>Generate Bill</h2>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    {/* Searchable Product Input Field */}
                    <div className="search-container">
                        <input
                            type="text"
                            name="productName"
                            placeholder="Search Product"
                            value={formData.productName}
                            onChange={handleProductSearch}
                            required
                            autoComplete="off"
                        />
                        {showDropdown && (
                            <ul className="dropdown">
                                {filteredProducts.map(product => (
                                    <li key={product._id} onClick={() => handleProductSelect(product)}>
                                        {product.productName}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                        min="1"
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
                                <th>Total Amount (₹)</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map((bill) => (
                                <tr key={bill._id}>
                                    <td>{bill.productName}</td>
                                    <td>{bill.quantity}</td>
                                    <td>₹{bill.amount}</td>
                                    <td>₹{bill.totalAmount}</td>
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
