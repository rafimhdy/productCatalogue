import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './css/Navbar.css';
import { FaShoppingCart, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    const handleBurgerClick = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleRegister = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/register');
    };

    const handleCartClick = () => {
        navigate('/cart');
    };

    const handleOrderHistoryClick = () => {
        navigate('/order-history');
    };

    const handleProfileClick = () => {
        navigate('/dashboard');
    };

    useEffect(() => {
        let lastScrollPosition = 0;
        const handleScroll = () => {
            const currentScrollPosition = window.scrollY;
            // Hanya aktifkan is-sticky jika user mulai scroll ke bawah
            setIsSticky(currentScrollPosition > 50);
            lastScrollPosition = currentScrollPosition;
        };

        window.addEventListener('scroll', handleScroll);

        // Mengunci scroll saat menu terbuka
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'initial';
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.body.style.overflow = 'initial';
        };
    }, [isMenuOpen]);

    return (
        <header className={`header ${isSticky ? 'is-sticky' : ''}`} id="header">
            <nav className="navbar container">
                <Link to="/" className="brand">
                    Our Shop
                </Link>

                {/* Menu Utama (Akan disembunyikan di Mobile) */}
                <div className={`menu ${isMenuOpen ? 'is-active' : ''}`} id="menu">
                    <ul className="menu-inner">
                        <li className="menu-item">
                            <Link to="/" className="menu-link" onClick={handleLinkClick}>
                                Home
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/products" className="menu-link" onClick={handleLinkClick}>
                                Products
                            </Link>
                        </li>
                        <li className="menu-item">
                            <Link to="/order-history" className="menu-link" onClick={handleLinkClick}>
                                Order History
                            </Link>
                        </li>
                        {/* Tambahkan elemen menu-block di sini agar ikut masuk dropdown */}
                        <li className="menu-item menu-block-mobile">
                            <div className="menu-block-inner">
                                {user?.role === 'customer' ? (
                                    <div className="user-info-mobile">
                                        <span className="user-name-mobile">
                                            {user?.name
                                                ? `Hi, ${user.name.split(' ')[0]}`
                                                : `Hi, Customer #${user.id}`}
                                        </span>
                                        <button type="button" className="btn btn-darken btn-logout" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <button type="button" className="btn btn-darken" onClick={handleRegister}>
                                        Register
                                    </button>
                                )}
                            </div>
                        </li>
                    </ul>
                </div>

                {/* Menu Block Desktop & Tombol Mobile yang Selalu Terlihat */}
                <div className="menu-block">

                    {/* Cart Button (Selalu terlihat, diatur oleh CSS order) */}
                    <button type="button" className="btn btn-neutral btn-cart" onClick={handleCartClick}>
                        <FaShoppingCart />
                    </button>

                    {/* Profile Button for authenticated customers */}
                    {user?.role === 'customer' && (
                        <button type="button" className="btn btn-neutral btn-profile" onClick={handleProfileClick}>
                            <FaUser />
                        </button>
                    )}

                    {/* User Info / Register Button (Hanya terlihat di desktop) */}
                    {user?.role === 'customer' ? (
                        <div className="user-info-desktop">
                            <span className="user-name-desktop">
                                {user?.name
                                    ? `Hi, ${user.name.split(' ')[0]}`
                                    : `Hi, Customer #${user.id}`}
                            </span>
                            <button type="button" className="btn btn-darken btn-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <button type="button" className="btn btn-darken btn-register-desktop" onClick={handleRegister}>
                            Register
                        </button>
                    )}

                    {/* Burger Button (Hanya terlihat di mobile) */}
                    <button
                        type="button"
                        className={`burger ${isMenuOpen ? 'is-active' : ''}`}
                        id="burger"
                        onClick={handleBurgerClick}
                    >
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;