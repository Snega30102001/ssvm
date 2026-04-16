import React, { useEffect, useRef } from "react";
import lottie from "lottie-web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../assets/css/runner.css";
import TugAnimation from "../assets/json/thug.json";

gsap.registerPlugin(ScrollTrigger);

const TugAnimationSticker = () => {
    const lottieRef = useRef(null);
    const wrapperRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {

        // Load Lottie
        playerRef.current = lottie.loadAnimation({
            container: lottieRef.current,
            renderer: "svg",
            loop: true,
            autoplay: false,
            animationData: TugAnimation
        });

        // Initial hidden state
        gsap.set(wrapperRef.current, {
            opacity: 0,
            y: 40,
            scale: 0.8
        });

        // Scroll Trigger
        ScrollTrigger.create({
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "top 60%",

            onEnter: () => {

                gsap.to(wrapperRef.current, {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.6,
                    ease: "power3.out"
                });

                playerRef.current?.play();
            },

            onLeaveBack: () => {

                gsap.to(wrapperRef.current, {
                    opacity: 0,
                    y: 40,
                    scale: 0.8,
                    duration: 0.4
                });

                playerRef.current?.pause();
            }
        });

        // ✅ Refresh ScrollTrigger when Lottie is loaded
        playerRef.current.addEventListener("DOMLoaded", () => {
            ScrollTrigger.refresh();
        });


        return () => {
            playerRef.current?.destroy();
        };

    }, []);

    return (
        <span ref={wrapperRef} className="runner-inline">
            <div ref={lottieRef}></div>
        </span>
    );
};

export default TugAnimationSticker;