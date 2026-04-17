import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Component/Sidebar';
import SettingsView from '../Component/SettingsView';
import '../assets/registration/DashboardPage.css';

const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [activeCategory, setActiveCategory] = useState(localStorage.getItem('activeCategory') || 'overview');
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination & Search States
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    const navigate = useNavigate();
    const mainRef = useRef(null);
    const cardsRef = useRef([]);
    const searchTimeoutRef = useRef(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/login');
            return;
        }

        setUser(JSON.parse(storedUser));

        if (window.innerWidth < 992) {
            setSidebarOpen(false);
        }
    }, [navigate]);

    // Reset pagination when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory]);

    // Fetch data when activeCategory, page, or searchTerm changes
    useEffect(() => {
        localStorage.setItem('activeCategory', activeCategory);
        
        // Debounce search
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        
        searchTimeoutRef.current = setTimeout(() => {
            if (activeCategory === 'overview') {
                fetchRegistrations(null, currentPage, searchTerm);
            } else if (activeCategory !== 'settings') {
                fetchRegistrations(activeCategory, currentPage, searchTerm);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(searchTimeoutRef.current);
    }, [activeCategory, currentPage, searchTerm]);

    const fetchRegistrations = async (categoryId = null, page = 1, search = '') => {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        let url = `http://localhost/smm/ssvm-school/public/api/registrations?page=${page}`;
        
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }

        if (categoryId && categoryId !== 'overview') {
            if (categoryId.startsWith('guru-')) {
                const typeMap = {
                    'guru-internal-self': 'internal-self',
                    'guru-internal-others': 'internal-other',
                    'guru-external-self': 'external-self',
                    'guru-external-others': 'external-other'
                };
                url += `&award_group=guru&nomination_type=${typeMap[categoryId]}`;
            } else if (categoryId.startsWith('student-')) {
                const typeMap = {
                    'student-internal': 'internal',
                    'student-external': 'external'
                };
                url += `&award_group=studentpreneur&nomination_type=${typeMap[categoryId]}`;
            }
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const result = await response.json();
            if (result.success) {
                setRegistrations(result.data);
                setCurrentPage(result.current_page);
                setLastPage(result.last_page);
                setTotalRecords(result.total);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    return (
        <div className={`dashboard-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            <Sidebar 
                isOpen={isSidebarOpen} 
                toggleSidebar={toggleSidebar} 
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                handleLogout={handleLogout}
            />

            <div className="main-wrapper">
                <header className="top-bar">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <i className={`bi ${isSidebarOpen ? 'bi-text-indent-left' : 'bi-list'}`}></i>
                    </button>
                    
                    <div className="top-bar-right">
                        <div className="search-box">
                            <i className="bi bi-search"></i>
                            <input 
                                type="text" 
                                placeholder="Auto search records..." 
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="user-profile-mini">
                            <div className="avatar">{user?.name?.charAt(0)}</div>
                            <div className="user-info">
                                <span className="name">{user?.name}</span>
                                <span className="role">Administrator</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="content-area" ref={mainRef}>
                    <div className="welcome-section">
                        <h1>{activeCategory === 'overview' ? 'Dashboard Overview' : activeCategory.replace(/-/g, ' ').toUpperCase()}</h1>
                        <p>Found {totalRecords} total registrations.</p>
                    </div>

                    {activeCategory === 'settings' ? (
                        <SettingsView user={user} setUser={setUser} />
                    ) : (
                        <>
                            {activeCategory === 'overview' && (
                                <div className="stats-container">
                                    {[
                                        { label: 'Total Registrations', value: totalRecords, icon: 'bi-person-plus', color: '#631542', trend: '+100%' },
                                        { label: 'Guru Awards', value: 'Live', icon: 'bi-award', color: '#f39c12', trend: '' },
                                        { label: 'Studentpreneur', value: 'Live', icon: 'bi-mortarboard', color: '#27ae60', trend: '' }
                                    ].map((stat, i) => (
                                        <div key={i} className="stat-card-premium" ref={el => cardsRef.current[i] = el}>
                                            <div className="stat-card-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                                <i className={`bi ${stat.icon}`}></i>
                                            </div>
                                            <div className="stat-card-info">
                                                <span className="stat-label">{stat.label}</span>
                                                <div className="stat-row">
                                                    <span className="stat-value">{stat.value}</span>
                                                    <span className="stat-trend">{stat.trend}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="dashboard-grid full-width">
                                <section className="table-section">
                                    <div className="section-header">
                                        <h2>{activeCategory === 'overview' ? 'Recent Registrations' : 'Inbound Details'}</h2>
                                        <div className="table-header-actions">
                                            <span className="records-count">{totalRecords} Records Found</span>
                                            <button className="view-all-btn" onClick={() => fetchRegistrations(activeCategory, currentPage, searchTerm)}>Refresh</button>
                                        </div>
                                    </div>
                                    <div className="table-responsive">
                                        {loading ? (
                                            <div className="loading-state">Updating records...</div>
                                        ) : (
                                            <table className="custom-table">
                                                <thead>
                                                    <tr>
                                                        <th>Nominee Name</th>
                                                        <th>Contact</th>
                                                        <th>Category</th>
                                                        <th>Nomination</th>
                                                        <th>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {registrations.map((reg, i) => (
                                                        <tr key={i}>
                                                            <td>
                                                                <div className="td-name">
                                                                    <div className="small-avatar">{reg.student_name?.charAt(0)}</div>
                                                                    {reg.student_name} {reg.last_name}
                                                                </div>
                                                            </td>
                                                            <td>{reg.email}<br/><small>{reg.phone}</small></td>
                                                            <td>{reg.award_group}</td>
                                                            <td><span className="status-pill reviewing">{reg.nomination_type}</span></td>
                                                            <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                                                        </tr>
                                                    ))}
                                                    {registrations.length === 0 && (
                                                        <tr>
                                                            <td colSpan="5">
                                                                <div className="no-records">
                                                                    <i className="bi bi-folder-x"></i>
                                                                    <p>No records match your search criteria.</p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>

                                    {/* Pagination Controls */}
                                    {lastPage > 1 && (
                                        <div className="pagination-wrapper">
                                            <button 
                                                disabled={currentPage === 1} 
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                className="pag-btn"
                                            >
                                                <i className="bi bi-chevron-left"></i> Previous
                                            </button>
                                            <div className="pag-info">
                                                Page <span>{currentPage}</span> of {lastPage}
                                            </div>
                                            <button 
                                                disabled={currentPage === lastPage} 
                                                onClick={() => setCurrentPage(prev => Math.min(lastPage, prev + 1))}
                                                className="pag-btn"
                                            >
                                                Next <i className="bi bi-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </section>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardPage;
