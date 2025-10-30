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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-3">
            FarmConnect
          </h1>
          <p className="text-gray-600 text-lg">
            Connecting farmers and buyers directly
          </p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="text-center mt-6 animate-in" style={{ animationDelay: '0.2s' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-700 hover:text-green-700 font-medium transition-all duration-200 group"
          >
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span className="text-green-600 group-hover:text-green-700 underline decoration-2 underline-offset-4">
                  Register here
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="text-green-600 group-hover:text-green-700 underline decoration-2 underline-offset-4">
                  Login here
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
