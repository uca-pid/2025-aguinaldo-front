import React from "react";
import Logo from "../img/MediBook-Logo.png"
const Login: React.FC = () => {
  return (

    <div style={{width:"100vw",height:"100vh", boxSizing:"border-box", display:"flex",justifyContent:"center", alignItems:"center"}}> 
        <div style={{ width:"100%",height:"100%", boxSizing:"border-box", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <img style={{maxWidth:"100%", maxHeight:"100%"}}src={Logo}></img>
        </div>
        <div style={{backgroundColor:"#1f4f6fff", width:"100%",height:"100%", boxSizing:"border-box", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", borderTopLeftRadius:25,borderBottomLeftRadius:25}}>
            <text style={{
                    color: "#fff",
                    margin: "10",
                    fontWeight:"bold",
                    fontSize:20,
                   }}>Usuario</text>
            <input style={{borderRadius: 8,
                    border: "1px solid #fff",
                    background: "rgba(255, 255, 255, 0.12)",
                    color: "#fff",
                    margin: "10px 0",
                    padding: "0.75rem 1rem",
                    width: "250px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border 0.2s"}}type="email"  />
            <text style={{
                    color: "#fff",
                    margin: "10",
                    fontWeight:"bold",
                    fontSize:20,
                   }}>Contraseña</text>
            <input style={{borderRadius: 8,
                    border: "1px solid #fff",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    margin: "10px 0",
                    padding: "0.75rem 1rem",
                    width: "250px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border 0.2s"}} type="password" />
            <button style={{
                backgroundColor:"#38A3A5",
                    color: "#ffffffff",
                    margin: 20,
                    fontWeight:"bold",
                    fontSize:20,
                    borderRadius: 8,
                   }}>Iniciar Sesion</button>  
        </div>
    </div>
  );
};

export default Login;