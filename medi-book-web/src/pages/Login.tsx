import React, {useState} from "react";

import Logo from "../img/MediBook-Logo.png";
import "../style/Login.css";

const Login: React.FC = () => {

    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
      
        const validUser = "admin@demo.com";
        const validPass = "123456";

        if (!user || !password) {
            setError("Por favor, complete ambos campos.");
        } else if (user === validUser && password === validPass) {
            setError("");
            alert("¡Login exitoso!");
        } else {
            setError("Usuario o contraseña incorrectos.");
            setShake(true);
            setTimeout(() => setShake(false), 400);
        }
    };

    return (
    <div className="login-box"> 
        <div className="login-logo">
            <img className="img-login-logo" src={Logo} alt="Logo" />
        </div>
        <div className="input-login-block">
            <span className="login-input-text">Usuario</span>
            <input
                value={user}
                onChange={e => setUser(e.target.value)}
                className={`input-user${shake ? " shake" : ""}`}
                type="email"
            />
            <span className="login-input-text">Contraseña</span>
            <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`input-password${shake ? " shake" : ""}`}
                type="password"
            />
            {error && <div style={{ color: "red", margin: "10px 0" }}>{error}</div>}
            <button onClick={handleLogin} className="animated-button">Iniciar Sesion</button>  
        </div>
    </div>
  );
};

export default Login;