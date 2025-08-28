import React from 'react';

interface Participant {
  id: string;
  name: string;
  image: string;
  odds: number;
}

interface BettingCardProps {
  id: string;
  title: string;
  participants: Participant[];
  combinedImage?: string;
  volume: string;
  date: string;
  startTime?: string;
  endTime?: string;
  chance?: number;
  isSettled?: boolean;
  winner?: string;
  onBet?: (participantId: string) => void;
  onNavigate?: (marketId: string) => void;
}

const BettingCard: React.FC<BettingCardProps> = ({
  id,
  title,
  participants,
  volume,
  combinedImage,
  date,
  startTime,
  endTime,
  chance = 60,
  isSettled = false,
  onBet,
  onNavigate,
}) => {
  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(id);
    }
  };

  const handleBetClick = (e: React.MouseEvent, participantId: string) => {
    e.stopPropagation();
    if (onBet) {
      onBet(participantId);
    }
  };

  const participant1 = participants[0] ?? null;
  const participant2 = participants[1] ?? null;

  if (!participant1 || !participant2) {
    return <div>Error: Not enough participants.</div>;
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-2 hover:shadow-lg transition-shadow cursor-pointer border ${isSettled ? 'border-yellow-400 border-2' : 'border-yellow-300'}`}
      onClick={handleCardClick}
    >
      <h3 className="text-sm font-semibold text-gray-800 mb-3 leading-tight">{title}</h3>

      <div className="flex flex-col">
        <div className="flex items-start gap-2">
          {/* Combined rectangular image - takes 1/3 width */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-20 sm:h-24 rounded-lg overflow-hidden mb-2 border-2 border-gray-200">
              <img
                src={combinedImage || participant1.image || '/imgs/img1.png'}
                alt={`${participant1.name} vs ${participant2.name}`}
                className="w-full h-full object-cover"
              />
            </div>
            {!isSettled && (
              <div className="flex flex-row gap-2 w-full">
                <button
                  onClick={(e) => handleBetClick(e, participant1.id)}
                  className="bg-forest-green hover:bg-green-600 text-white px-3 py-2 text-sm font-medium transition-colors rounded flex-1"
                >
                  {participant1.name}
                </button>
                <button
                  onClick={(e) => handleBetClick(e, participant2.id)}
                  className="bg-cripson hover:bg-red-600 text-white px-3 py-2 text-sm font-medium transition-colors rounded flex-1"
                >
                  {participant2.name}
                </button>
              </div>
            )}
          </div>

          {/* Right side: pie chart/chance or settled checkmark - takes remaining space */}
          <div className="flex flex-col items-center justify-center flex-shrink-0 w-16 sm:w-20">
            {isSettled ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-vivid-green rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <>
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="14" fill="#e5e7eb" />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="28"
                      strokeDasharray={`${(chance / 100) * 88} 88`}
                      strokeLinecap="butt"
                      transform="rotate(-90 16 16)"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="28"
                      strokeDasharray={`${((100 - chance) / 100) * 88} 88`}
                      strokeDashoffset={`-${(chance / 100) * 88}`}
                      strokeLinecap="butt"
                      transform="rotate(-90 16 16)"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">Chance {chance}%</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <div className="flex items-center justify-start mt-3 pt-2 border-t border-gray-100 gap-x-4">
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <svg className="w-3 h-3 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1L2 12l10 10 10-10L12 1z" />
          </svg>
          <span>Volume {volume}</span>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-600">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          <span>{date}</span>
        </div>
        {(startTime || endTime) && (
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {startTime && endTime 
                ? `${startTime.split(':').slice(0, 2).join(':')} - ${endTime.split(':').slice(0, 2).join(':')}`
                : (startTime || endTime)?.split(':').slice(0, 2).join(':')
              }
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BettingCard;


