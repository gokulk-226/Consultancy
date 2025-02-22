import { useState, useEffect } from 'react';
import axios from 'axios';

function LowStock() {
    const [lowStockProducts, setLowStockProducts] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/products/low-stock')
            .then(response => setLowStockProducts(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div style={styles.container}>
            <h2>Low Stock Alert</h2>
            {lowStockProducts.length > 0 ? (
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStockProducts.map(product => (
                            <tr key={product._id}>
                                <td>{product.productName}</td>
                                <td style={{ color: 'red' }}>{product.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No low-stock products!</p>
            )}
        </div>
    );
}

const styles = {
    container: { textAlign: 'center', padding: '20px' },
    table: { margin: 'auto', borderCollapse: 'collapse', width: '50%' },
    td: { border: '1px solid black', padding: '10px' }
};

export default LowStock;
