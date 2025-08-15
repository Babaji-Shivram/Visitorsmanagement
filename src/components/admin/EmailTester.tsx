import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';

interface TestEmailResponse {
  message: string;
}

const EmailTester: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'checking' | 'connected' | 'disconnected'>('idle');

  const getApiBaseUrl = () => '/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setStatus('error');
      setResult('Please enter an email address');
      return;
    }

    setStatus('loading');
    
    try {
      const response = await fetch(
  `${getApiBaseUrl()}/email/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ 
            email, 
            message: message || undefined 
          })
        }
      );
      
      if (response.ok) {
        const data: TestEmailResponse = await response.json();
        setStatus('success');
        setResult(data.message);
      } else {
        const errorData = await response.json();
        setStatus('error');
        setResult(`Error: ${errorData.message || 'Failed to send test email'}`);
      }
    } catch (error) {
      setStatus('error');
      setResult('Network error. Please check if the API server is running and try again.');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('checking');
    
    try {
      const response = await fetch(
  `${getApiBaseUrl()}/email/test-connection`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.connected) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Email Service Tester</h2>
      
      <div className="mb-6">
        <button 
          onClick={testConnection}
          disabled={connectionStatus === 'checking'}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          {connectionStatus === 'checking' ? 'Checking...' : 'Test SMTP Connection'}
        </button>
        
        {connectionStatus === 'connected' && (
          <div className="mt-2 text-sm flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" /> 
            SMTP server connection successful
          </div>
        )}
        
        {connectionStatus === 'disconnected' && (
          <div className="mt-2 text-sm flex items-center text-red-600">
            <AlertCircle className="w-4 h-4 mr-1" /> 
            Could not connect to SMTP server
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Enter a custom message for the test email"
          />
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          <Send className="w-4 h-4 mr-2" />
          {status === 'loading' ? 'Sending...' : 'Send Test Email'}
        </button>
        
        {status === 'success' && (
          <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md flex items-start">
            <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{result}</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{result}</span>
          </div>
        )}
      </form>
      
      <div className="mt-6 text-sm text-gray-500">
        <p className="font-medium mb-1">Note:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Test emails are only sent through this interface and won't affect real notifications.</li>
          <li>This feature is available only to administrators.</li>
          <li>Check spam folders if you don't see the test email.</li>
          <li>Ensure both frontend (port 5173/5174) and API server (port 5000) are running.</li>
        </ul>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Servers Status:</strong> To use email testing, make sure both servers are running:
        </p>
        <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
          <li>Frontend: <code>npm run dev</code> (typically port 5173 or 5174)</li>
          <li>API Server: <code>cd VisitorManagement.API && dotnet run</code> (port 5000)</li>
        </ul>
      </div>
    </div>
  );
};

export default EmailTester;
