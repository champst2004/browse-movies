import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <>
            <NavBar />
            <main className="main-content">
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;