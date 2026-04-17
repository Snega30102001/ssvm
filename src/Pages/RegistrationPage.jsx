import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import RegistrationForm from '../Component/RegistrationForm';
import CustomCursor from '../Component/Cursor';

const RegistrationPage = () => {
    const pageRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        // Simple entrance animation
        const ctx = gsap.context(() => {
            gsap.from(".registration-form-container", {
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "power4.out"
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <div className="registration-page-wrapper" ref={pageRef} style={{ background: '#f8f9fa' }}>
            {/* Professional Mesh Background */}
            <div className="page-hero-bg" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(at 0% 0%, rgba(99, 21, 66, 0.03) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(212, 175, 55, 0.03) 0%, transparent 50%)',
                zIndex: 0,
                pointerEvents: 'none'
            }}></div>

            <div className="registration-content-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <div className="registration-form-container">
                    <RegistrationForm />
                </div>
            </div>
            
        </div>
    );
};

export default RegistrationPage;
