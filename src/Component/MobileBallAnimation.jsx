import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import LetterReveal from "./LetterReveal";

import "../assets/css/mobileball.css";
import volleyballData from "../assets/json/699cbf57a3baf554905772e8_volleyball_desktop.json";

gsap.registerPlugin(ScrollTrigger);

const MobileBallAnimation = () => {
    const lottieContainer = useRef(null);
    const containerRef = useRef(null);
    const pinRef = useRef(null);
    const ballRef = useRef(null);
    const contentRef = useRef(null);
    const bgRevealRef = useRef(null);

    useEffect(() => {
        const anim = lottie.loadAnimation({
            container: lottieContainer.current,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: volleyballData,
        });

        anim.addEventListener("DOMLoaded", () => {
            const totalFrames = anim.totalFrames;

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "+=50%", // 🔥 longer scroll = smoother control
                    pin: pinRef.current,
                    scrub: 1.2, // smooth lag
                    anticipatePin: 1,
                }
            });

            // =========================
            // 🟡 PHASE 1: BALL + BG (0 → 25%)
            // =========================
            tl.to(ballRef.current, {
                y: -window.innerHeight,
                scale: 0.1,
                opacity: 0,
                ease: "power2.inOut",
                duration: 5,
            }, 0);

            tl.fromTo(bgRevealRef.current,
                { clipPath: "circle(0% at 50% 50%)" },
                { clipPath: "circle(150% at 50% 50%)", duration: 5 },
                -5
            );

            // =========================
            // 🎬 PHASE 2: LOTTIE SCRUB (25 → 65%)
            // =========================
            tl.to({}, {
                duration: 5,
                onUpdate: function () {
                    const progress = this.progress();
                    const frame = progress * (totalFrames - 1);
                    anim.goToAndStop(frame, true);
                }
            }, 0.5);

            // =========================
            // ✨ PHASE 3: TEXT REVEAL (65 → 80%)
            // =========================
            tl.to(contentRef.current, {
                opacity: 1,
                visibility: "visible",
                duration: 0.5
            }, .5);

            tl.fromTo(".text-reveal-item",
                { y: 40, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.3, duration: 1 },
                .5
            );

            const letters = document.querySelectorAll(".text-reveal-item .letter");
            tl.fromTo(letters,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, stagger: 0.03, duration: 0.6 },
                .5
            );

            // =========================
            // 🧑‍💼 PHASE 4: FOUNDER REVEAL (80 → 100%)
            // =========================
            tl.to(".main-brand-stack", {
                // y: -20,
                scale: 0.95,
                duration: 1,
                ease: "power2.out"
            }, .5);

            tl.fromTo(".founder-reveal-item",
                { y: 60, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.4)" },
                .5
            );
        });

        return () => {
            anim.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="mobile-discover-v12 d-block d-md-none overflow-hidden"
            style={{ height: "70vh", position: "relative", zIndex: 100 }}
        >
            <div ref={pinRef} className="w-100 h-100 position-relative">

                {/* BG REVEAL */}
                <div
                    ref={bgRevealRef}
                    className="position-absolute w-100 h-100"
                    style={{ clipPath: "circle(0% at 50% 50%)", background: "#F2FF33", zIndex: 1 }}
                />

                {/* BALL */}
                <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 5 }}>
                    <div ref={ballRef} className="minimal-ball-v12"></div>
                </div>

                {/* CONTENT */}
                <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-end pb-5" style={{ zIndex: 10 }}>

                    {/* LOTTIE */}
                    <div style={{ height: "12vh", width: "100%" }}>
                        <div ref={lottieContainer} />
                    </div>

                    {/* TEXT */}
                    <div
                        ref={contentRef}
                        // style={{ opacity: 0, visibility: "hidden" }}
                        className="text-center px-3 mb-5"
                    >
                        <div className="text-reveal-item mb-3">
                            <div className="main-brand-stack">
                                <LetterReveal text="Ssvm Transforming" className="fw-bold text-dark" controlled />
                                <LetterReveal text="India Conclave" className="fw-bold text-dark" controlled />
                                <LetterReveal text="2026" className="fw-bold text-dark" controlled />
                            </div>
                        </div>

                        {/* <div className="founder-reveal-item left_fonder_content ">
                            <img src="/assets/images/ssvm-founder-anim.gif" className="w-75" />
                            <h2 className="main_heading_about fw-bold mt-2 text-black">Dr. Manimekalai Mohan</h2>
                            <h2 className="main_heading_about text-black">Founder, SSVM Institutions</h2>
                        </div> */}
                    </div>

                </div>
            </div>

            <style>{`
                .minimal-ball-v12 {
                    width: 75px;
                    height: 75px;
                    background: #F2FF33;
                    border-radius: 50%;
                }
            `}</style>
        </div>
    );
};

export default MobileBallAnimation;