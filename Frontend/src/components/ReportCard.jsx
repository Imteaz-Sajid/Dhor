import React, { useState, useEffect } from 'react';
import { voteAPI } from '../services/api';

const CRIME_BADGE = {
  Extortion: 'bg-purple-100 text-purple-800',
  Theft: 'bg-yellow-100 text-yellow-800',
  Robbery: 'bg-orange-100 text-orange-800',
  Harassment: 'bg-pink-100 text-pink-800',
  Assault: 'bg-red-100 text-red-800',
  Other: 'bg-gray-100 text-gray-800',
};

const ReportCard = ({ report }) => {
  const [confirmCount, setConfirmCount] = useState(0);
  const [disputeCount, setDisputeCount] = useState(0);
  const [userVote, setUserVote] = useState(null); // 'Confirm' | 'Dispute' | null
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await voteAPI.getStats(report._id);
        setConfirmCount(data.stats.confirmCount);
        setDisputeCount(data.stats.disputeCount);
        setUserVote(data.stats.userVote);
      } catch (err) {
        console.error('Failed to load vote stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [report._id]);

  const handleVote = async (type) => {
    if (userVote === type) return; // already voted this way, no-op

    // Save state for rollback
    const prevVote = userVote;
    const prevConfirm = confirmCount;
    const prevDispute = disputeCount;

    // Optimistic update
    let newConfirm = confirmCount;
    let newDispute = disputeCount;
    if (prevVote === 'Confirm') newConfirm -= 1;
    if (prevVote === 'Dispute') newDispute -= 1;
    if (type === 'Confirm') newConfirm += 1;
    if (type === 'Dispute') newDispute += 1;

    setConfirmCount(newConfirm);
    setDisputeCount(newDispute);
    setUserVote(type);

    try {
      await voteAPI.castVote(report._id, type);
    } catch {
      // Roll back on failure
      setConfirmCount(prevConfirm);
      setDisputeCount(prevDispute);
      setUserVote(prevVote);
    }
  };

  const totalVotes = confirmCount + disputeCount;
  const trustPct = totalVotes > 0 ? (confirmCount / totalVotes) * 100 : 0;
  const disputePct = totalVotes > 0 ? (disputeCount / totalVotes) * 100 : 0;

  const avatarUrl = report.isAnonymous
    ? `https://ui-avatars.com/api/?name=Anonymous&background=808080`
    : report.userId?.profilePicture ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(report.userId?.name || 'U')}&background=random`;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5 space-y-4">
      {/* Header: avatar, name, location/date, crime type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={avatarUrl}
            alt={report.isAnonymous ? 'Anonymous' : report.userId?.name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {report.isAnonymous ? '🔒 Anonymous' : (report.userId?.name || 'Anonymous')}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {report.thana && report.district
                ? `${report.thana}, ${report.district}`
                : 'Location unknown'}
              {' · '}
              {new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
            CRIME_BADGE[report.crimeType] || CRIME_BADGE.Other
          }`}
        >
          {report.crimeType}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="font-bold text-gray-900 text-base mb-1">{report.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{report.description}</p>
      </div>

      {/* Optional image */}
      {report.imageUrl && (
        <img
          src={report.imageUrl}
          alt="Report evidence"
          className="w-full h-48 object-cover rounded-lg"
        />
      )}

      {/* Trust Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-medium text-green-600">✓ Confirm {confirmCount}</span>
          <span className="text-gray-400">
            {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
          </span>
          <span className="font-medium text-red-500">Dispute {disputeCount} ✗</span>
        </div>

        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-green-500 transition-all duration-500 ease-out"
            style={{ width: `${trustPct}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all duration-500 ease-out"
            style={{ width: `${disputePct}%` }}
          />
        </div>

        {totalVotes > 0 ? (
          <p className="text-xs text-center text-gray-400">
            Trust Score:{' '}
            <span className="font-semibold text-gray-700">{Math.round(trustPct)}%</span>
          </p>
        ) : (
          <p className="text-xs text-center text-gray-400">
            No votes yet — be the first to verify
          </p>
        )}
      </div>

      {/* Vote Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleVote('Confirm')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold
            transition-all duration-150 border-2
            ${
              userVote === 'Confirm'
                ? 'bg-green-500 border-green-500 text-white shadow-md scale-[1.02]'
                : 'border-green-400 text-green-600 bg-white hover:bg-green-50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ✅ Confirm
        </button>
        <button
          onClick={() => handleVote('Dispute')}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg text-sm font-semibold
            transition-all duration-150 border-2
            ${
              userVote === 'Dispute'
                ? 'bg-red-500 border-red-500 text-white shadow-md scale-[1.02]'
                : 'border-red-400 text-red-500 bg-white hover:bg-red-50'
            }
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          ❌ Refute
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
