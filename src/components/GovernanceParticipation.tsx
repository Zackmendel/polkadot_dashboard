import React, { useEffect, useState } from 'react';
import { fetchPolkassemblyData } from '../utils/polkassemblyApi';

interface UserActivity {
  id: number;
  type: string;
  created_at: string;
  details: {
    proposal_id?: number;
    motion_id?: number;
    referendum_index?: number;
    comment_id?: number;
    title?: string;
    content?: string;
  };
}

interface PolkassemblyUserActivities {
  activities: UserActivity[];
  totalCount: number;
}

interface GovernanceParticipationProps {
  address: string;
}

const GovernanceParticipation: React.FC<GovernanceParticipationProps> = ({ address }) => {
  const [governanceData, setGovernanceData] = useState<PolkassemblyUserActivities | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getGovernanceData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchPolkassemblyData<PolkassemblyUserActivities>('users/user-activities', {
          address,
          limit: 10,
          page: 0
        });
        if (response && response.data) {
          setGovernanceData(response.data);
        } else {
          setGovernanceData(null);
        }
      } catch (err) {
        setError('Failed to fetch governance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      getGovernanceData();
    }
  }, [address]);

  if (loading) {
    return <div className="text-center py-4">Loading governance participation...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Governance Participation (Polkassembly)</h2>
      {governanceData && governanceData.activities.length > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">Total Activities: {governanceData.totalCount}</p>
          <div className="space-y-4">
            {governanceData.activities.map((activity) => (
              <div key={activity.id} className="bg-gray-700 p-4 rounded-md">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-blue-400 font-semibold capitalize">{activity.type}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                </div>
                {activity.details.title && (
                  <p className="text-sm mb-2">{activity.details.title}</p>
                )}
                {activity.details.referendum_index !== undefined && (
                  <p className="text-sm text-gray-400">Referendum #{activity.details.referendum_index}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4">No governance participation data found for this address.</div>
      )}
    </div>
  );
};

export default GovernanceParticipation;
