import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TitleReveal = ({ text, className = "", style = {} }) => {
  const containerRef = useRef(null);

  useLayoutEffect(() => {
    const letters = containerRef.current.querySelectorAll(".letter");

    const ctx = gsap.context(() => {
      gsap.from(letters, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
        opacity: 0,
        scale: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.04,
        ease: "back.out(1.7)",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [text]);

  return (
    <h2
      ref={containerRef}
      className={className}
      style={{
        ...style,
        display: "block",
        overflow: "hidden", // Prevent flash
      }}
    >
      {text.split("").map((char, index) => (
        <span
          key={index}
          className="letter"
          style={{
            display: "inline-block",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </h2>
  );
};

export default TitleReveal;
