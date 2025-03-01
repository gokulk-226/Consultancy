import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddStock from './pages/AddStock';
import GenerateBill from './pages/GenerateBill';
import LowStock from './pages/LowStock';
import './App.css';

function Navbar() {
    return (
        <nav className="app-navbar">
            <h1 className="app-logo">KPS SILKS</h1>
            <div className="app-nav-links">
                {['Home', 'Add Stock', 'Generate Bill', 'Low Stock'].map((item, index) => (
                    <Link 
                        key={index} 
                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                        className="app-nav-link"
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

function Home() {
    const [products, setProducts] = useState([]);
    const [sales, setSales] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productRes = await fetch("http://localhost:5000/api/products");
                const salesRes = await fetch("http://localhost:5000/api/bills");

                if (!productRes.ok || !salesRes.ok) throw new Error("Failed to fetch data");

                const productData = await productRes.json();
                const salesData = await salesRes.json();

                setProducts(groupByProduct(productData));
                setSales(groupByProduct(salesData));
            } catch (err) {
                console.error("❌ Error:", err);
                setError("Failed to load data. Please try again.");
            }
        };

        fetchData();
    }, []);

    const groupByProduct = (data) => {
        const map = new Map();
        data.forEach(({ productName, quantity, amount }) => {
            if (map.has(productName)) {
                const product = map.get(productName);
                product.quantity += quantity;
                product.totalAmount += quantity * amount;
            } else {
                map.set(productName, { productName, quantity, totalAmount: quantity * amount });
            }
        });
        return Array.from(map.values());
    };

    const totalPurchasedAmount = products.reduce((acc, product) => acc + product.totalAmount, 0);
    const totalSalesAmount = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return (
        <div className="app-home-container">
            <div className="app-dashboard">
                <h2>Dashboard Overview</h2>

                {error && <p className="app-error-message">{error}</p>}

                <div className="app-summary">
                    <h3>Total Purchased Products: {products.length}</h3>
                    <h3>Total Purchased Amount: ₹{totalPurchasedAmount.toFixed(2)}</h3>
                    <h3>Total Sold Products: {sales.length}</h3>
                    <h3>Total Sales Amount: ₹{totalSalesAmount.toFixed(2)}</h3>
                </div>

                <div className="app-grid-container">
                    <TableSection title="Purchased Products" data={products} />
                    <TableSection title="Sales Products" data={sales} />
                </div>
            </div>
        </div>
    );
}

const TableSection = ({ title, data }) => (
    <div className="app-table-section">
        <h3>{title}</h3>
        <table className="app-data-table">
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                {data.length > 0 ? (
                    data.map(({ productName, quantity, totalAmount }) => (
                        <tr key={productName}>
                            <td>{productName}</td>
                            <td>{quantity}</td>
                            <td>₹{totalAmount.toFixed(2)}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3">No Data Available</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

function Content() {
    return (
        <div className="app-content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add-stock" element={<AddStock />} />
                <Route path="/generate-bill" element={<GenerateBill />} />
                <Route path="/low-stock" element={<LowStock />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <Content />
            </div>
        </Router>
    );
}

export default App;
