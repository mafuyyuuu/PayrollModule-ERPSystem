/* landing page layout */
import {Outlet} from "react-router-dom";
import LiquidEther from "../../components/LiquidEther.jsx";
import './Auth.css';

export default function Auth() {
    return (
        <div className="hero">
            <LiquidEther
                colors={['#2969ff', '#9efff9', '#dbf0a3']}
                mouseForce={20}
                cursorSize={100}
                isViscous={false}
                viscous={30}
                iterationsViscous={32}
                iterationsPoisson={32}
                resolution={0.5}
                isBounce={false}
                autoDemo={true}
                autoSpeed={0.5}
                autoIntensity={2.2}
                takeoverDuration={0.25}
                autoResumeDelay={3000}
                autoRampDuration={0.6}
            />
            <Outlet /> {/* THIS must exist*/}
        </div>
    );
}