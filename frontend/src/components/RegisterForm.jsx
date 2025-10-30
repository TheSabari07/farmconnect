import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, UserCircle } from 'lucide-react';
import api from '../api';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'BUYER',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      
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
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Handle validation errors (field-specific)
        if (typeof errorData === 'object' && !errorData.error) {
          setFieldErrors(errorData);
        } else {
          // Handle general errors
          setError(typeof errorData === 'string' 
            ? errorData 
            : errorData.error || 'Registration failed');
        }
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
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Create Account</h2>
        <p className="text-center text-gray-600 mb-8">Join the farm marketplace</p>
        
        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            icon={UserIcon}
            error={fieldErrors.name}
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            icon={Mail}
            error={fieldErrors.email}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            icon={Lock}
            error={fieldErrors.password}
            helperText="Minimum 6 characters"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <UserCircle size={18} />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent hover:border-gray-400"
                required
              >
                <option value="BUYER">Buyer - Purchase farm products</option>
                <option value="FARMER">Farmer - Sell your products</option>
                <option value="ADMIN">Admin - Manage platform</option>
              </select>
            </div>
            {fieldErrors.role && (
              <p className="mt-1.5 text-sm text-red-600">{fieldErrors.role}</p>
            )}
          </div>
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
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
