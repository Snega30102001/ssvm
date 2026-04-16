import React, { useEffect, useRef } from "react";
import { DotLottie } from "@lottiefiles/dotlottie-web";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../assets/css/runner.css";
import RunnerLottie from "../assets/json/699c0d84fa87821af2dbcf61_runner_1.lottie";

gsap.registerPlugin(ScrollTrigger);

const RunnerStickerAnimation = () => {
    const lottieRef = useRef(null);
    const wrapperRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {

        // Load Lottie (do not autoplay)
        playerRef.current = new DotLottie({
            autoplay: false,
            loop: true,
            canvas: lottieRef.current,
            src: RunnerLottie,
        });

        // Initial hidden state
        gsap.set(wrapperRef.current, {
            opacity: 0,
            y: 40,
            scale: 0.8
        });

        // Scroll trigger animation
        const st = ScrollTrigger.create({
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

        // ✅ Refresh ScrollTrigger when Lottie is ready
        playerRef.current.addEventListener("ready", () => {
            ScrollTrigger.refresh();
        });

        playerRef.current.addEventListener("load", () => {
            ScrollTrigger.refresh();
        });


        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
            }
        };

    }, []);

    return (
        <span ref={wrapperRef} className="runner-inline">
            <canvas ref={lottieRef}></canvas>
        </span>
    );
};

export default RunnerStickerAnimation;