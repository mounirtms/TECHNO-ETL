import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Link,
    CircularProgress,
    Alert,
    Divider,
    useTheme,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

const StyledPaper = styled(Paper)(({ theme }) => ({
    marginTop: theme.spacing(8),
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    maxWidth: '400px',
    width: '100%',
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    '& img': {
        width: '180px',
        height: 'auto',
    },
}));

const GoogleButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    backgroundColor: '#ffffff',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
        borderColor: theme.palette.grey[300],
    },
    '& .MuiButton-startIcon': {
        marginRight: theme.spacing(1),
    },
}));

const Login = () => {
    const theme = useTheme();
    const { signInWithGoogle, signInWithMagento, currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (currentUser) {
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [currentUser, navigate, location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMagentoSignIn = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await signInWithMagento(formData.username, formData.password);
            // Navigation will be handled by the useEffect
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Invalid username or password. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await signInWithGoogle();
            // Navigation will be handled by the useEffect
        } catch (error) {
            console.error('Google login error:', error);
            setError('Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.default,
        }}>
            <Container component="main" maxWidth={false} sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: theme.spacing(3),
            }}>
                <StyledPaper elevation={0}>
                    <LogoContainer>
                        <img src="/src/assets/images/logo_techno.png" alt="Logo" />
                    </LogoContainer>
  

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

          
                    <GoogleButton
                        fullWidth
                        variant="outlined"
                        startIcon={<GoogleIcon />}
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                    >
                        Sign in with Google
                    </GoogleButton>
                </StyledPaper>
            </Container>
            <Footer 
             isLoginScreen={true} 
             />
        </Box>
    );
};

export default Login;
