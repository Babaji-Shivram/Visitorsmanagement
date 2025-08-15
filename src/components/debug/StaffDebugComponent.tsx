import React from 'react';
import { useStaff } from '../../contexts/StaffContext';

const StaffDebugComponent: React.FC = () => {
  const { staffMembers, isLoading, error } = useStaff();

  return (
    <div className="p-4 bg-gray-100 border rounded">
      <h3 className="text-lg font-bold mb-2">Staff Debug Info</h3>
      <div className="mb-2">
        <strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}
      </div>
      <div className="mb-2">
        <strong>Error:</strong> {error || 'None'}
      </div>
      <div className="mb-2">
        <strong>Staff Count:</strong> {staffMembers.length}
      </div>
      <div className="mb-2">
        <strong>Staff List:</strong>
        <ul className="ml-4 list-disc">
          {staffMembers.map(staff => (
            <li key={staff.id}>
              {staff.firstName} {staff.lastName} - {staff.email} ({staff.role})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StaffDebugComponent;
