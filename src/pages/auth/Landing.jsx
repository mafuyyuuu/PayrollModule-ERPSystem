import { useNavigate } from 'react-router-dom';
import TextType from "../../components/TextType.jsx";
import FadeContent from "../../components/FadeContent.jsx";
import './Landing.css';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div className="landing-content">
            <div className="typing-wrapper">
                <TextType
                    className="typing-text"
                    text={["Payroll Management", "Lenscape Studio"]}
                    typingSpeed={120}
                    pauseDuration={2000}
                    showCursor={true}
                    cursorCharacter="_"
                />
            </div>

            <FadeContent blur={true} duration={1000} easing="ease-out" initialOpacity={0}>
                <p className="description">
                    The <span className="bold-text">Payroll Management System</span> is a platform that manages employee payroll operations efficiently. It automates salary computation, generates reports, and ensures secure, on-time payouts to employees.
                </p>
            </FadeContent>

            <button className="continue-btn" onClick={() => navigate('/login')}>
                Continue
            </button>
        </div>
    );
}