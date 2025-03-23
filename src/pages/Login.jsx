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
    styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MagentoService from '../services/magentoService';
import Footer from '../components/Layout/Footer';

const LoginContainer = styled(Container)({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
});

const LoginCard = styled(Box)(({ theme }) => ({
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.spacing(4),
    padding: theme.spacing(4),
    width: '100%',
    maxWidth: 450,
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    textAlign: 'center',
}));

const LoginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await MagentoService.login(credentials.username, credentials.password);
            localStorage.setItem('magento_token', response.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
            <LoginContainer maxWidth="sm">
                <LoginCard>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Login to TechnoStationary
                    </Typography>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField 
                        label="Username" 
                        name="username" 
                        fullWidth 
                        margin="normal" 
                        variant="outlined"
                        onChange={handleChange} 
                    />
                    <TextField 
                        label="Password" 
                        name="password" 
                        type="password" 
                        fullWidth 
                        margin="normal" 
                        variant="outlined"
                        onChange={handleChange} 
                    />
                    <Button 
                        fullWidth 
                        variant="contained" 
                        sx={{ mt: 2 }}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Login'}
                    </Button>
                </LoginCard>
            </LoginContainer>
            <Footer isLoginScreen={true} />
        </Box>
    );
};

export default LoginPage;
