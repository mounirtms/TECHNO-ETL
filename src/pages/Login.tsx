import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
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
import logoTechno from '../assets/images/logo_techno.png';
import technoIcon from '../assets/images/techno.png';

// Logo rotation animation
const logoRotation = keyframes`
    0% {
        transform: rotate(0deg) scale(1);
    25% {
        transform: rotate(90deg) scale(1.1);
    50% {
        transform: rotate(180deg) scale(1);
    75% {
        transform: rotate(270deg) scale(1.1);
    100% {
        transform: rotate(360deg) scale(1);
`;

// Logo pulse animation
const logoPulse = keyframes`
    0% {
        opacity: 0.8;
        transform: scale(1);
    50% {
        opacity: 1;
        transform: scale(1.05);
    100% {
        opacity: 0.8;
        transform: scale(1);
`;

// Animated background keyframes
const backgroundAnimation = keyframes`
    0% {
        background-position: 0% 50%;
    50% {
        background-position: 100% 50%;
    100% {
        background-position: 0% 50%;
`;

// Floating elements animation
const floatAnimation = keyframes`
    0% {
        transform: translateY(0px);
    50% {
        transform: translateY(-15px);
    100% {
        transform: translateY(0px);
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
    borderRadius: Number(theme.shape.borderRadius) * 2,
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

// Professional Loading Component with Rotating Logo
const LoadingOverlay = styled(Box)(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: theme.zIndex.modal + 1,
    gap: theme.spacing(3),
}));

const RotatingLogo = styled(Box)(({ theme }) => ({
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: `${logoRotation} 2s linear infinite`,
    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.1)`,
    '& img': {
        width: '70%',
        height: '70%',
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)', // Make logo white
    },
}));

const LoadingText = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 500,
    animation: `${logoPulse} 1.5s ease-in-out infinite`,
    textAlign: 'center',
}));

const LoadingDots = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(0.5),
    '& .dot': {
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: theme.palette.primary.main,
        animation: `${logoPulse} 1s ease-in-out infinite`,
        '&:nth-of-type(1)': { animationDelay: '0s' },
        '&:nth-of-type(2)': { animationDelay: '0.2s' },
        '&:nth-of-type(3)': { animationDelay: '0.4s' },
    },
}));

const LoginPage = () => {
    const theme = useTheme();
    const { signInWithGoogle, signInWithMagento } = useAuth();
    const { translate } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true';

    useEffect(() => {
        // Redirect to dashboard immediately in dev mode
        if(skipAuth) {
            navigate('/', { replace: true });
    }, [skipAuth, navigate]);

    // If in dev mode, don't render the login page
    if(skipAuth) {
        return null;
    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            setError(null);
            await signInWithGoogle();
            // Navigation handled by AuthContext
        } catch(err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
    };

    const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            await signInWithMagento(email, password);
            // Navigation handled by AuthContext
        } catch(err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
    };

    // Create floating background elements
    const [floatingElements, setFloatingElements] = useState<Array<{
        top: string;
        left: string;
        width: string;
        height: string;
        backgroundColor: string;
        animationDelay: string;
    }>>([]);

    useEffect(() => {
        const generateFloatingElements = () => {
            const elements = [];
            for(let i = 0; i < 10; i++) {
                elements.push({
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 100 + 50}px`,
                    height: `${Math.random() * 100 + 50}px`,
                    backgroundColor: theme.palette.primary.light,
                    animationDelay: `${Math.random() * 5}s`,
                });
            setFloatingElements(elements);
        };

        generateFloatingElements();
    }, [theme]);

    return (
        <Box sx={{
                minHeight: '100vh',
                paddingBottom: `${FOOTER_HEIGHT}px`,
                position: 'relative',
                overflow: 'hidden',
            }}>
            {/* Animated Background */}
            <AnimatedBackground />

            {/* Floating Background Elements */}
            {floatingElements.map((element, index) => (
                <FloatingElement
                    key={index}
                    sx={{
                        top: element.top,
                        left: element.left,
                        width: element.width,
                        height: element.height,
                        backgroundColor: element.backgroundColor,
                        animationDelay: element.animationDelay,
                    }}
                />
            ))}

            <LoginContainer maxWidth="sm"></
                <LoginCard>
                    <Typography variant="h4"
                        sx={{
                            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            mb: 2,
                        }}>
                        TechnoStationary
                    </Typography>

                    <Typography variant="h6"
                        sx={{ mb: 3 }}>
                        {translate('login.welcome')}
                    </Typography>

                    {error && (
                        <Alert severity="error"
                            sx={{ width: '100%', mt: 2, mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Email/Password Login Form */}
                    <Box component="form" onSubmit={handleEmailPasswordSignIn} sx={{ mt: 2 }}></
                        <TextField fullWidth
                            label={translate('login.email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            type="email"
                        />
                        <TextField fullWidth
                            label={translate('login.password')}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                        />
                        <Button fullWidth
                            variant="contained"
                            type="submit"
                            sx={{ mt: 2, mb: 2 }}
                            disabled={loading}>
                            {translate('login.signIn')}
                        </Button>
                    </Box>

                    {/* Divider */}
                    <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}></
                        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: theme.palette.divider }} />
                        <Typography variant="outlined" sx={{ mx: 2, color: theme.palette.text.secondary }}>
                            OR
                        </Typography>
                        <Box sx={{ flexGrow: 1, height: '1px', backgroundColor: theme.palette.divider }} />
                    </Box>

                    {/* Google Sign-In Button */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}></
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
                </LoginCard>
            </LoginContainer>

            {/* Professional Loading Overlay with Rotating Logo */}
            {loading && (
                <LoadingOverlay></
                    <RotatingLogo>
                        <img src={technoIcon} alt="Techno Logo" />
                    </RotatingLogo>
                    <LoadingText variant="h6">
                        {translate('login.signingIn') || 'Signing you in...'}
                    </LoadingText>
                    <LoadingDots></
                        <Box className="dot" />
                        <Box className="dot" /></
                        <Box className="dot" /></Box>
                </LoadingOverlay>
            )}

            <Footer isLoginScreen={true} /></Footer>
    );
};

export default LoginPage;