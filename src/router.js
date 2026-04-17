import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SecurityUtils } from "./utils/Security";

import Homepage from "./Pages/Homepage";
import StudentpreneurAward from "./Pages/StudentpreneurAward";
import RegistrationPage from "./Pages/RegistrationPage";
import LoginPage from "./Pages/LoginPage";
import DashboardPage from "./Pages/DashboardPage";
import Preloader from "./Component/Preloader";

import AOS from "aos";
import "aos/dist/aos.css";

// ✅ Common layout
import Navbar from "./Pages/Navbar";
import Footer from "./Pages/Footer";
import CustomCursor from "./Component/Cursor";

gsap.registerPlugin(ScrollTrigger);

// 🔥 Layout wrapper
// 🔥 Layout wrapper with Outlet for nested routes
const Layout = () => {
    return (
        <>
            <CustomCursor />
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

// 🔥 Navigation stability handler
const NavigationHandler = ({ setLoading }) => {
    const { pathname } = useLocation();
    const isFirstMount = React.useRef(true);

    useEffect(() => {
        // 1. Skip the loading trigger on the very first mount if we just auto-recovered
        const skip = sessionStorage.getItem('skip_preloader') === 'true';
        
        if (isFirstMount.current && skip) {
            isFirstMount.current = false;
            sessionStorage.removeItem('skip_preloader');
            window.scrollTo(0, 0);
            return; 
        }

        isFirstMount.current = false;

        // 2. Immediately kill all ScrollTriggers before React tries to unmount
        if (window.ScrollTrigger) {
            window.ScrollTrigger.getAll().forEach(t => {
                t.revert();
                t.kill();
            });
            window.ScrollTrigger.refresh();
        }

        if (window.gsap) window.gsap.killTweensOf("*");

        window.scrollTo(0, 0);
        setLoading(true);
        document.body.style.overflow = "hidden";

        const timer = setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "auto";
            
            setTimeout(() => {
                if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            }, 300);
        }, 600); 

        return () => clearTimeout(timer);
    }, [pathname, setLoading]);

    return null;
};

const Router = () => {
    // Check if we should skip the preloader (only after an auto-recovery reload)
    const [loading, setLoading] = useState(() => {
        return sessionStorage.getItem('skip_preloader') !== 'true';
    });

    // AOS init
    useEffect(() => {
        AOS.init({ duration: 1000, once: false, easing: "ease-in-out" });
    }, []);

    // Prevent scroll restore
    // 🔥 1. Prevent browser scroll restoration (VERY IMPORTANT)
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // 🔥 Page Enter Clear Logic (Runs ONCE on app load)
    useEffect(() => {
        const initSecurity = async () => {
            try {
                await SecurityUtils.clearAppCache();
            } catch (e) {
                console.error("Router: Security initialization failed", e);
            }
        };
        initSecurity();
    }, []);

    // 🔥 Global GSAP stability settings
    useEffect(() => {
        gsap.config({
            autoSleep: 60,
            force3D: true,
        });

        ScrollTrigger.config({
            ignoreMobileResize: true,
        });

        ScrollTrigger.defaults({
            anticipatePin: 1,
        });
    }, []);

    return (
        <BrowserRouter>
            <NavigationHandler setLoading={setLoading} />
            {loading ? (
                <Preloader />
            ) : (
                <Routes>
                    {/* Wrap all routes in the single Layout instance */}
                    <Route element={<Layout />}>
                        {/* ✅ Homepage */}
                        <Route path="/" element={<Homepage />} />

                        {/* ✅ Other Routes */}
                        <Route path="/studentpreneur-award" element={<StudentpreneurAward />} />
                        <Route path="/register" element={<RegistrationPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                    </Route>
                </Routes>
            )}
        </BrowserRouter>
    );
};

export default Router;