'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, { token });
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.message ||
        'Failed to verify email. The token may be invalid or expired.'
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mb-4">
              <span className="text-white text-2xl font-bold">AC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Email Verification
            </h1>
          </div>

          {/* Status Content */}
          <div className="text-center">
            {status === 'verifying' && (
              <div className="space-y-4">
                <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                <p className="text-gray-600">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Email Verified!
                  </h2>
                  <p className="text-gray-600">{message}</p>
                  <p className="text-sm text-gray-500 mt-4">
                    Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="w-16 h-16 text-red-600 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-gray-600">{message}</p>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
