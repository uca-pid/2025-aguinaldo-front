import React  from "react";
import Logo from "../img/MediBook-Logo.png";
import "../style/Login.css";


const Login: React.FC = () => {
    return (

    <div style={{width:"100vw",height:"100vh", boxSizing:"border-box", display:"flex",justifyContent:"center", alignItems:"center"}}> 
        <div style={{ width:"100%",height:"100%", boxSizing:"border-box", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
            <img style={{maxWidth:"100%", maxHeight:"100%"}}src={Logo}></img>

        </div>
        <div style={{backgroundColor:"#1f4f6fff", width:"100%",height:"100%",maxWidth:"100%", maxHeight:"100%", boxSizing:"border-box", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", borderTopLeftRadius:25,borderBottomLeftRadius:25}}>
            <text style={{
                    color: "#fff",
                    margin: 5,
                    fontWeight:"bold",
                    fontSize:20,
                   }}>Usuario</text>
            <input className="input-user" type="email"  />
            <text   style={{
                    color: "#fff",
                    margin: 5,
                    fontWeight:"bold",
                    fontSize:20,
                   }}>Contraseña</text>
            <input className="input-password" type="password" />
            <button className="animated-button"
                   
                >Iniciar Sesion</button>  
        </div>
    </div>
  );
};

export default Login;