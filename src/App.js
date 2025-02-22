import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddStock from './pages/AddStock';
import GenerateBill from './pages/GenerateBill';
import LowStock from './pages/LowStock';
import './App.css';

function Navbar() {
    return (
        <nav className="navbar">
            <h1 className="logo">KPS SILKS</h1>
            <div className="nav-links">
                {['Home', 'Add Stock', 'Generate Bill', 'Low Stock'].map((item, index) => (
                    <Link 
                        key={index} 
                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                        className="nav-link"
                    >
                        {item}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

function Content() {
    return (
        <div className="content">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/add-stock" element={<AddStock />} />
                <Route path="/generate-bill" element={<GenerateBill />} />
                <Route path="/low-stock" element={<LowStock />} />
            </Routes>
        </div>
    );
}

function Home() {
    return (
        <div className="home-container">
            <h2 className="subtitle">Welcome to</h2>
            <h1 className="title">KPS SILKS</h1>
            <p className="description">Effortlessly manage your stock with our inventory system.</p>
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
