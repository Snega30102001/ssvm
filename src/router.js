import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SecurityUtils } from "./utils/Security";

import Homepage from "./Pages/Homepage";
import Preloader from "./Component/Preloader";

gsap.registerPlugin(ScrollTrigger);

const Router = () => {
    const [loading, setLoading] = useState(true);

    // 🔥 1. Prevent browser scroll restoration (VERY IMPORTANT)
    useEffect(() => {
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }
    }, []);

    // 🔥 2. Reset scroll position and clear system on enter
    useEffect(() => {
        window.scrollTo(0, 0);
        
        // ✅ Page Enter Clear Logic
        const initSecurity = async () => {
            try {
                await SecurityUtils.clearAppCache();
            } catch (e) {
                console.clear();
                console.error("Router: Security initialization failed", e);
            }
        };
        initSecurity();
    }, []);

    // 🔥 3. Preloader + FINAL ScrollTrigger refresh fix
    useEffect(() => {
        document.body.style.overflow = "hidden";

        const timer = setTimeout(() => {
            setLoading(false);
            document.body.style.overflow = "auto";

            // ✅ FORCE layout calculation
            document.body.getBoundingClientRect();

            // ✅ Refresh ScrollTrigger shortly after Homepage mounts
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 600); // Wait for initial mount and first Lottie frames

            // ✅ Second pass for slower assets
            setTimeout(() => {
                ScrollTrigger.refresh();
            }, 2000);

        }, 2000);


        return () => clearTimeout(timer);
    }, []);

    // 🔥 4. Global GSAP stability settings
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

    if (loading) {
        return <Preloader />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Homepage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default Router;