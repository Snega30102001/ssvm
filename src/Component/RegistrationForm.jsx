import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import '../assets/registration/RegistrationForm.css';

const RegistrationForm = () => {
    const [step, setStep] = useState(1);
    const [mainCategory, setMainCategory] = useState(''); // 'guru' or 'studentpreneur'
    const [formData, setFormData] = useState({
        awardGroup: '',
        nominationType: '',
        studentName: '', // used for nominee/teacher name
        lastName: '',
        schoolName: '',
        phone: '',
        email: '',
        subjects: '',
        impact: '',
        vision: '',
        awardsWon: '',
        teacherProfile: '',
        isSSVMTeacher: '',
        experience: '',
        nominatorName: '',
        nominatorPhone: '',
        nominatorEmail: '',
        nominatorAddress: '',
        references: '',
        achievements: '',
        whyJoin: '',
        termsAccepted: false
    });

    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const formRef = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const [fileName, setFileName] = useState('');
    const [showCamera, setShowCamera] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [uploadPreview, setUploadPreview] = useState(null);
    const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'camera'

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            
            if (!allowedTypes.includes(file.type)) {
                alert('Only JPG, JPEG, and PNG files are accepted');
                e.target.value = '';
                return;
            }

            setFileName(file.name);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setCapturedImage(null);
        }
    };

    const removeImage = () => {
        setFileName('');
        setUploadPreview(null);
        setCapturedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        stopCamera();
    };

    const startCamera = async () => {
        setShowCamera(true);
        setCapturedImage(null);
        setUploadPreview(null);
        setFileName('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (video && canvas) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            setCapturedImage(dataUrl);
            stopCamera();
        }
    };

    const handleStepChange = (nextStep) => {
        gsap.to(formRef.current, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            onComplete: () => {
                setStep(nextStep);
                gsap.to(formRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
            }
        });
    };

    const awardTypes = {
        guru: [
            { id: 'internal-self', label: 'Internal - Self Nomination', desc: 'Nominating yourself as an SSVM educator' },
            { id: 'internal-other', label: 'Internal - Nominate Other', desc: 'Nominating a fellow SSVM colleague' },
            { id: 'external-self', label: 'External - Self Nomination', desc: 'Nominating yourself from another institution' },
            { id: 'external-other', label: 'External - Nominate Others', desc: 'Nominating an educator from outside' },
        ],
        studentpreneur: [
            { id: 'internal', label: 'Internal Studentpreneur', desc: 'For students currently studying at SSVM' },
            { id: 'external', label: 'External Studentpreneur', desc: 'For student entrepreneurs from other schools' },
        ]
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        
        // Append all text fields
        Object.keys(formData).forEach(key => {
            if (key !== 'termsAccepted') {
                data.append(key, formData[key]);
            }
        });
        
        // Add awardGroup specifically if not already set (mainCategory)
        data.append('awardGroup', mainCategory);

        // Append image if present
        if (uploadMode === 'upload' && fileInputRef.current?.files[0]) {
            data.append('photo', fileInputRef.current.files[0]);
        } else if (uploadMode === 'camera' && capturedImage) {
            data.append('capturedImage', capturedImage);
        }

        try {
            // Updated to use XAMPP Apache path
            const response = await fetch('http://localhost/smm/ssvm-school/public/api/register', {
                method: 'POST',
                body: data,
                headers: {
                    'Accept': 'application/json',
                }
            });

            const result = await response.json();

            if (response.ok && result.success) {
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert(result.message || 'Submission failed. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An error occurred while submitting. Please make sure the backend is running.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderStepper = () => (
        <div className="stepper-wrapper">
            <div className="stepper-progress">
                {[1, 2, 3].map(num => (
                    <div key={num} className={`step-node ${step === num ? 'active' : step > num ? 'completed' : ''}`}>
                        {step > num ? '✓' : num}
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                <span className="step-label">Category</span>
                <span className="step-label">Details</span>
                <span className="step-label">Submission</span>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div ref={formRef}>
                        <div className="step-header">
                            <h2>Select Award Category</h2>
                            <p>Choose the category you wish to participate in</p>
                        </div>
                        
                        {!mainCategory ? (
                            <div className="nomination-cards">
                                <div 
                                    className={`nomination-card`}
                                    onClick={() => setMainCategory('guru')}
                                >
                                    <i className="bi bi-person-workspace"></i>
                                    <h4>Inspirational Guru Awards</h4>
                                    <p>Honouring educators who shape mindsets and lives.</p>
                                </div>
                                <div 
                                    className={`nomination-card`}
                                    onClick={() => setMainCategory('studentpreneur')}
                                >
                                    <i className="bi bi-lightbulb"></i>
                                    <h4>Studentpreneur Awards</h4>
                                    <p>Recognizing young innovative minds and student ventures.</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h4 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>
                                    {mainCategory === 'guru' ? 'Inspirational Guru Awards' : 'Studentpreneur Awards'}
                                </h4>
                                <div className="nomination-cards">
                                    {awardTypes[mainCategory].map(type => (
                                        <div 
                                            key={type.id}
                                            className={`nomination-card ${formData.nominationType === type.id ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, nominationType: type.id, awardGroup: mainCategory }))}
                                        >
                                            <i className="bi bi-check2-circle"></i>
                                            <h4>{type.label}</h4>
                                            <p>{type.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="form-footer" style={{ marginTop: '30px' }}>
                                    <button className="nav-btn btn-back" onClick={() => setMainCategory('')}>Back to Main</button>
                                    <button 
                                        className="nav-btn btn-next" 
                                        disabled={!formData.nominationType}
                                        onClick={() => handleStepChange(2)}
                                    >
                                        Proceed
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 2:
                const isNominateOther = formData.nominationType.includes('other');
                const isGuru = mainCategory === 'guru';
                
                return (
                    <div ref={formRef}>
                        <div className="step-header">
                            <h2>{isGuru ? (isNominateOther ? 'Teacher Details' : 'Nominee Details') : 'Personal Information'}</h2>
                            <p>Please provide accurate details for the {isGuru ? 'educator' : 'student'}</p>
                        </div>
                        <div className="registration-form">
                            {/* Names Grid */}
                            <div className="input-group">
                                <label>{isGuru ? "Teacher's First Name" : "First Name"} *</label>
                                <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} placeholder="First Name" required />
                            </div>
                            <div className="input-group">
                                <label>{isGuru ? "Teacher's Last Name" : "Last Name"}</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
                            </div>

                            <div className="input-group full-width">
                                <label>{isGuru ? 'Name of the School' : 'Name of your School/College'} *</label>
                                <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} placeholder="School Name" required />
                            </div>

                            <div className="input-group">
                                <label>Phone *</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" />
                            </div>

                            {isGuru && (
                                <>
                                    <div className="input-group full-width">
                                        <label>Which subjects do they teach? *</label>
                                        <input type="text" name="subjects" value={formData.subjects} onChange={handleChange} placeholder="e.g. Mathematics, Science" required />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>How have they impacted their students lives? Tell us in few sentences *</label>
                                        <textarea name="impact" value={formData.impact} onChange={handleChange} rows="3" placeholder="Describe the impact..." required></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>What is their vision for the younger generations of our country? *</label>
                                        <textarea name="vision" value={formData.vision} onChange={handleChange} rows="3" placeholder="Vision for future..." required></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Have they won any awards?</label>
                                        <textarea name="awardsWon" value={formData.awardsWon} onChange={handleChange} rows="2" placeholder="List awards..."></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Brief profile about your teacher *</label>
                                        <textarea name="teacherProfile" value={formData.teacherProfile} onChange={handleChange} rows="3" placeholder="A short bio..." required></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Candidate Photo *</label>
                                        <div className="upload-choices">
                                            <div 
                                                className={`choice-btn ${uploadMode === 'upload' ? 'active' : ''}`}
                                                onClick={() => { setUploadMode('upload'); stopCamera(); }}
                                            >
                                                <i className="bi bi-upload"></i> Upload Photo
                                            </div>
                                            <div 
                                                className={`choice-btn ${uploadMode === 'camera' ? 'active' : ''}`}
                                                onClick={() => { setUploadMode('camera'); startCamera(); }}
                                            >
                                                <i className="bi bi-camera"></i> Live Capture
                                            </div>
                                        </div>

                                        <div className="file-upload-wrapper" style={{ marginTop: '15px' }}>
                                            {uploadMode === 'upload' ? (
                                                <>
                                                    {!uploadPreview ? (
                                                        <div className="file-upload-area">
                                                            <i className="bi bi-image"></i>
                                                            <span>Select photo from device</span>
                                                            <input 
                                                                type="file" 
                                                                ref={fileInputRef}
                                                                name="photo" 
                                                                onChange={handleFileChange} 
                                                                accept="image/*" 
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="photo-preview-wrap">
                                                            <img src={uploadPreview} alt="Selected" />
                                                            <div className="preview-overlay">
                                                                <span className="file-name-tag">{fileName}</span>
                                                                <button type="button" className="retake-btn" style={{ background: '#ff4757' }} onClick={removeImage}>
                                                                    <i className="bi bi-trash"></i> Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="camera-wrap">
                                                    {showCamera && (
                                                        <div className="camera-container">
                                                            <video ref={videoRef} autoPlay playsInline className="camera-video"></video>
                                                            <div className="camera-controls">
                                                                <button type="button" className="capture-btn" onClick={capturePhoto} title="Capture"></button>
                                                            </div>
                                                            <button type="button" className="camera-close-btn" onClick={stopCamera}>×</button>
                                                        </div>
                                                    )}
                                                    
                                                    {capturedImage && (
                                                        <div className="photo-preview-wrap">
                                                            <img src={capturedImage} alt="Captured" />
                                                            <div className="preview-overlay">
                                                                <button type="button" className="retake-btn" onClick={startCamera}>
                                                                    <i className="bi bi-arrow-clockwise"></i> Retake
                                                                </button>
                                                                <button type="button" className="retake-btn" style={{ right: '90px', background: '#ff4757' }} onClick={removeImage}>
                                                                    <i className="bi bi-trash"></i> Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {!showCamera && !capturedImage && (
                                                        <div className="file-upload-area" onClick={startCamera}>
                                                            <i className="bi bi-camera-fill"></i>
                                                            <span>Click to start camera</span>
                                                        </div>
                                                    )}
                                                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Are they a teacher from SSVM institutions? *</label>
                                        <div className="radio-group">
                                            <label className="radio-item">
                                                <input type="radio" name="isSSVMTeacher" value="yes" checked={formData.isSSVMTeacher === 'yes'} onChange={handleChange} />
                                                <span>Yes</span>
                                            </label>
                                            <label className="radio-item">
                                                <input type="radio" name="isSSVMTeacher" value="no" checked={formData.isSSVMTeacher === 'no'} onChange={handleChange} />
                                                <span>No</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>How many years of experience do they have? *</label>
                                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Number of years" required />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="form-footer">
                            <button className="nav-btn btn-back" onClick={() => handleStepChange(1)}>Back</button>
                            <button className="nav-btn btn-next" onClick={() => handleStepChange(3)}>Next Step</button>
                        </div>
                    </div>
                );
            case 3:
                const isGuruAward = mainCategory === 'guru';
                return (
                    <div ref={formRef}>
                        <div className="step-header">
                            <h2>{isGuruAward ? "Nominator Information" : "Final Submission"}</h2>
                            <p>{isGuruAward ? "Please provide your details as the nominator" : "Share your achievements and goals"}</p>
                        </div>
                        <div className="registration-form">
                            {isGuruAward ? (
                                <>
                                    <div className="input-group">
                                        <label>Nominator Name *</label>
                                        <input type="text" name="nominatorName" value={formData.nominatorName} onChange={handleChange} placeholder="Your Name" required />
                                    </div>
                                    <div className="input-group">
                                        <label>Nominator Mobile Number *</label>
                                        <input type="tel" name="nominatorPhone" value={formData.nominatorPhone} onChange={handleChange} placeholder="Your Phone" required />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Nominator Email *</label>
                                        <input type="email" name="nominatorEmail" value={formData.nominatorEmail} onChange={handleChange} placeholder="your.email@example.com" required />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Nominator Address</label>
                                        <textarea name="nominatorAddress" value={formData.nominatorAddress} onChange={handleChange} rows="2" placeholder="Your Address"></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Are there any more reference for the nominated teacher?</label>
                                        <textarea name="references" value={formData.references} onChange={handleChange} rows="2" placeholder="List other references..."></textarea>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="input-group full-width">
                                        <label>Key Achievements (Medals, Honors, Awards)</label>
                                        <textarea name="achievements" value={formData.achievements} onChange={handleChange} rows="3" placeholder="Describe your biggest wins..."></textarea>
                                    </div>
                                    <div className="input-group full-width">
                                        <label>Why do you want to join SSVM Excellence?</label>
                                        <textarea name="whyJoin" value={formData.whyJoin} onChange={handleChange} rows="3" placeholder="Tell us about your aspirations..."></textarea>
                                    </div>
                                </>
                            )}
                            
                            <div className="input-group full-width" style={{ marginTop: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', textTransform: 'none', color: 'var(--text-dark)' }}>
                                    <input 
                                        type="checkbox" 
                                        name="termsAccepted" 
                                        checked={formData.termsAccepted} 
                                        onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))} 
                                        style={{ marginTop: '4px' }}
                                        required
                                    />
                                    <span>Terms and conditions *<br />
                                    <small style={{ color: 'var(--text-muted)' }}>Eligibility: School teachers, only Nominations. Self nomination or nomination by others Verification: Teaching credentials will be verified Final: Shortlisted teachers must attend the event</small></span>
                                </label>
                            </div>
                        </div>
                        <div className="form-footer">
                            <button className="nav-btn btn-back" onClick={() => handleStepChange(2)}>Back</button>
                            <button 
                                className="nav-btn btn-next" 
                                onClick={handleSubmit} 
                                disabled={!formData.termsAccepted || submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <section className="registration-section">
            <div className="registration-container">
                {!submitted && renderStepper()}
                
                <div className="form-content-area">
                    {submitted ? (
                        <div className="success-card">
                            <div className="success-icon">✓</div>
                            <h2 style={{ fontFamily: 'Sneaker', fontSize: '48px', color: 'var(--primary)' }}>Application Received!</h2>
                            <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '500px', margin: '20px auto' }}>
                                Thank you for applying to the SSVM Sports Excellence Academy. Our verification team will review your application and get back to you soon.
                            </p>
                            <button className="nav-btn btn-next" onClick={() => window.location.href = '/'}>Return Home</button>
                        </div>
                    ) : (
                        renderStepContent()
                    )}
                </div>
            </div>
        </section>
    );
};

export default RegistrationForm;
