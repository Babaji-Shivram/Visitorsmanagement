import React, { useState } from 'react';

interface DatabaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hasPassword: boolean;
  role: string;
  isActive: boolean;
}

export const DatabaseChecker: React.FC = () => {
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkDatabase = async () => {
    setLoading(true);
    setError(null);
    
    // Try different API endpoints
    const apiUrls = [
      'http://localhost:5000/api/staff',
      'http://localhost:5001/api/staff',
      'https://localhost:7000/api/staff',
      'https://localhost:7001/api/staff'
    ];

    for (const url of apiUrls) {
      try {
        console.log(`🔍 Checking database at: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Database response:', data);
          
          const formattedUsers = data.map((user: any) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            hasPassword: !!user.passwordHash || !!user.password,
            role: user.role,
            isActive: user.isActive
          }));
          
          setUsers(formattedUsers);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.log(`❌ Failed to connect to ${url}:`, err);
      }
    }
    
    setError('Could not connect to any database API endpoint');
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Database User Checker</h3>
      
      <button
        onClick={checkDatabase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Checking Database...' : 'Check Database Users'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Database Users Found:</h4>
          <div className="space-y-2">
            {users.map(user => (
              <div key={user.id} className="p-3 border rounded">
                <div className="font-medium">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-sm">
                  <span className={`px-2 py-1 rounded text-xs ${user.hasPassword ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.hasPassword ? 'Has Password' : 'No Password'}
                  </span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${user.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.role} - {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
