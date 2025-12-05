/* landing page layout */
import {Outlet} from "react-router-dom";
import LiquidEther from "../../components/LiquidEther.jsx";
import './Auth.css';

export default function Auth() {
    return (
        <div className="hero">
            <Outlet />
        </div>
    );
}