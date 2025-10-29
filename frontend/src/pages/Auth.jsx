import { useState, useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Clear any old tokens when auth page loads
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        // If user object doesn't have id field, it's an old token - clear it
        if (!parsedUser.id) {
          console.log('Clearing old token format...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (e) {
        // Invalid JSON, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            Farm Marketplace
          </h1>
          <p className="text-gray-600">
            Connecting farmers and buyers directly
          </p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 hover:text-green-800 font-medium transition duration-200"
          >
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span className="underline">Register here</span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="underline">Login here</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
