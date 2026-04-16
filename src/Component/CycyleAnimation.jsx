import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../assets/css/cycle.css";
import bikeAnimation from "../assets/json/69ad30372873beed539c57eb_bike.json";

gsap.registerPlugin(ScrollTrigger);

const CycleAnimation = () => {
    const sectionRef = useRef(null);
    const lottieRef = useRef(null);
    const contentRef = useRef(null);

    useEffect(() => {
        let animation;

        animation = lottie.loadAnimation({
            container: lottieRef.current,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: bikeAnimation,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid meet",
            },
        });

        const onLoaded = () => {
            const totalFrames = animation.totalFrames;
            const playhead = { frame: 0 };

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=1800",
                    scrub: true,
                    pin: true,
                },
            });

            // ✅ Refresh after setting up ScrollTrigger
            ScrollTrigger.refresh();


            /* ---------------------------
               🚴 LOTTIE: left → right
            ----------------------------*/
            gsap.set(lottieRef.current, {
                x: "-40vw",
                opacity: 1,
            });

            tl.to(lottieRef.current, {
                x: "120vw", // move across and out
                ease: "none",
            }, 0);

            /* ---------------------------
               🎬 LOTTIE FRAME SYNC
            ----------------------------*/
            tl.to(
                playhead,
                {
                    frame: totalFrames - 1,
                    ease: "none",
                    onUpdate: () => {
                        animation.goToAndStop(Math.round(playhead.frame), true);
                    },
                },
                0
            );

            /* ---------------------------
               📦 CONTENT: left → center
            ----------------------------*/
            gsap.set(contentRef.current, {
                x: "-100vw",
                opacity: 1,
            });

            tl.to(
                contentRef.current,
                {
                    x: "0vw",
                    ease: "power3.out",
                },
                0.6 // starts after bike begins moving
            );
        };

        animation.addEventListener("DOMLoaded", onLoaded);

        return () => {
            if (animation) animation.destroy();
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

    return (
        <section ref={sectionRef} className="cycle-section">
            <div className="cycle-wrapper">

                {/* 🚴 Lottie */}
                <div ref={lottieRef} className="cycle-lottie" />

                {/* 📦 Content */}
                <div ref={contentRef} className="cycle-content">
                    <h2>SSVM Conclave</h2>
                    <p>
                        The SSVM Transforming India Conclave is a platform where ideas meet action.
                    </p>
                </div>

            </div>
        </section>
    );
};

export default CycleAnimation;