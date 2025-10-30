import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import api from '../api';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      
      // Save token and user info to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        role: response.data.role,
      }));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else if (err.response?.data) {
        setError(typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data.error || 'Login failed');
      } else {
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-in">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl px-8 pt-8 pb-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-8">Sign in to your account</p>
        
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="space-y-5">
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            required
          />
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            Sign In
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
