import { useState, useEffect } from 'react';
import axios from 'axios';

function LowStock() {
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/products/low-stock')
            .then(response => {
                const filteredProducts = response.data.filter(product => product.quantity < 100);
                setLowStockProducts(filteredProducts);
            })
            .catch(error => console.error(error));
    }, []);

    return (
        <div className="low-stock-container">
            <h2>Low Stock Alert</h2>
            {lowStockProducts.length > 0 ? (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Manufacturer</th>
                                <th>Date</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockProducts.map(product => (
                                <tr key={product._id}>
                                    <td>{product.productName}</td>
                                    <td>{product.manufacturer}</td>
                                    <td>{new Date(product.date).toLocaleDateString()}</td>
                                    <td className="low-stock-quantity">{product.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p>No low-stock products!</p>
            )}
        </div>
    );
}

export default LowStock;
