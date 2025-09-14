import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import Logo from "../img/MediBook-Logo.png";
import "./Login.css";



import TextField from '@mui/material/TextField';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";



const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#22577A",
      dark: "#1F4F6F",
      light: "#2D7D90",
    },
    secondary: {
      main: "#38A3A5",
      dark: "#286A85",
      light: "#57CC99",
    },
    success: {
      main: "#57CC99",
    },
    background: {
      default: "#F5FDF7",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0D2230",
      secondary: "#1F4F6F",
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#38A3A5",
            },
            "&:hover fieldset": {
              borderColor: "#38A3A5",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#57CC99",
            },
          },
          "& .MuiInputLabel-root": {
            color: "#ffffffff",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#57CC99",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "#38A3A5",
          },
          "&:hover fieldset": {
            borderColor: "#38A3A5",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#57CC99",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#ffffffff",
          "&.Mui-focused": {
            color: "#57CC99",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          padding: "8px 20px",
        },
      },
    },
  },
});

const Login: React.FC = () => {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  // const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

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

  const handleRegister = () => {
    // navigate("/Register");
  };

  const handleForgotPassword = () => {
    // navigate("/ForgotPassword");
  };

  return (
     <ThemeProvider theme={theme}>
      <CssBaseline />
        <div className="login-box">
        <div className="login-logo">
            <img className="img-login-logo" src={Logo} alt="Logo" />
        </div>

        <div className="input-login-block">
            <div >
                <div style={{margin:"25px"}}>
                    <TextField  id="outlined-basic" label="Usuario" variant="outlined" fullWidth/>
                </div>
                <div style={{margin:"25px"}}>
                    <FormControl  variant="outlined" fullWidth>
                        <InputLabel htmlFor="outlined-adornment-password">Password</InputLabel>
                        <OutlinedInput
                            id="outlined-adornment-password"
                            type={showPassword ? 'text' : 'password'}
                            endAdornment={
                            <InputAdornment position="end">
                                <IconButton
                                aria-label={
                                    showPassword ? 'hide the password' : 'display the password'
                                }
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                                >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                            }
                            label="Password"
                        />
                    </FormControl>
                </div>
                
            </div>
            <button onClick={handleLogin} className="animated-button">
            Iniciar Sesión
            </button>

            <span className="register-text" onClick={handleRegister}>
            Registrar usuario
            </span>
        </div>
        </div>
    </ThemeProvider>
  );
};

export default Login;