import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    CircularProgress,
    Alert,
    TextField,
    useTheme,
    keyframes,
    styled,
    Grid,
    Link
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Footer from '../components/Layout/Footer';
import { FOOTER_HEIGHT } from '../components/Layout/Constants';
import { useNavigate } from 'react-router-dom';
import magentoApi from '../services/magentoService';
// Animated background keyframes
const backgroundAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0% 50%;
    }
`;

// Floating elements animation
const floatAnimation = keyframes`
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-15px);
    }
    100% {
        transform: translateY(0px);
    }
`;

// Styled components
const AnimatedBackground = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `linear-gradient(
        -45deg, 
        ${theme.palette.primary.main}, 
        ${theme.palette.secondary.main}, 
        ${theme.palette.primary.light}, 
        ${theme.palette.secondary.light}
    )`,
    backgroundSize: '400% 400%',
    animation: `${backgroundAnimation} 15s ease infinite`,
    zIndex: -1,
}));

const LoginContainer = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    position: 'relative',
    zIndex: 1,
}));

const LoginCard = styled(Box)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(4),
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 650,
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.15)',
    },
}));

const FloatingElement = styled(Box)(({ theme }) => ({
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0.6,
    zIndex: -1,
    animation: `${floatAnimation} 5s ease-in-out infinite`,
}));

const GoogleButton = styled(Button)(({ theme }) => ({
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 2,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
    backgroundColor: '#ffffff',
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        backgroundColor: theme.palette.grey[50],
        borderColor: theme.palette.primary.main,
    },
    '& .MuiButton-startIcon': {
        marginRight: theme.spacing(1),
    },
}));

const LoginPage = () => {
    const theme = useTheme();
    const { signInWithGoogle, signInWithMagento } = useAuth();
    const { translate } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

    useEffect(() => {
        // Redirect to dashboard immediately in dev mode
        if (skipAuth) {
            navigate('/', { replace: true });
        }
    }, [skipAuth, navigate]);

    // If in dev mode, don't render the login page
    if (skipAuth) {
        return null;
    }

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
            // Navigation handled by AuthContext
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEmailPasswordSignIn = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
           
            await signInWithMagento(email, password);
            // Navigation handled by AuthContext
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create floating background elements
    const [floatingElements, setFloatingElements] = useState([]);

    useEffect(() => {
        const generateFloatingElements = () => {
            const elements = [];
            for (let i = 0; i < 10; i++) {
                elements.push({
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                    backgroundColor: theme.palette.primary.light,
                    animationDelay: `${Math.random() * 5}s`,
                });
            }
            setFloatingElements(elements);
        };

        generateFloatingElements();
    }, [theme]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                paddingBottom: `${FOOTER_HEIGHT}px`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Floating Background Elements */}
            {floatingElements.map((element, index) => (
                <FloatingElement
                    key={index}
                    sx={{
                        ...element,
                        animationDelay: element.animationDelay,
                    }}
                />
            ))}

            <LoginContainer maxWidth="sm">
                <LoginCard>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        TechnoStationary
                    </Typography>

                    <Typography
                        variant="h6"
                        color="textSecondary"
                        gutterBottom
                    >
                        {translate('login.welcome')}
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ width: '100%', mt: 2, mb: 2 }}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Email/Password Login Form */}
                    <Box component="form" onSubmit={handleEmailPasswordSignIn} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                        />
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            sx={{ mt: 2, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Sign In'}
                        </Button>
                    </Box>

                    {/* Divider */}
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: theme.palette.divider }} />
                        <Typography variant="body2" sx={{ mx: 2, color: theme.palette.text.secondary }}>
                            OR
                        </Typography>
                        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: theme.palette.divider }} />
                    </Box>

                    {/* Google Sign-In Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <GoogleButton
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                        >
                            {translate('login.signInWithGoogle')}
                        </GoogleButton>
                    </Box>

                    {/* Sign Up Link */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Link href="/signup" color="primary">
                            Sign Up
                        </Link>
                    </Typography>
                </LoginCard>
            </LoginContainer>

            <Footer isLoginScreen={true} />
        </Box>
    );
};

export default LoginPage;