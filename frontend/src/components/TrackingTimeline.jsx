const TrackingTimeline = ({ deliveryStatus, estimatedDate, actualDate }) => {
  const statuses = [
    { key: 'PENDING', label: 'Order Shipped', icon: '📦' },
    { key: 'IN_TRANSIT', label: 'In Transit', icon: '🚚' },
    { key: 'DELIVERED', label: 'Delivered', icon: '✅' },
  ];

  const statusIndex = {
    'PENDING': 0,
    'IN_TRANSIT': 1,
    'DELIVERED': 2,
    'FAILED': -1,
  };

  const currentIndex = statusIndex[deliveryStatus] ?? -1;
  const isFailed = deliveryStatus === 'FAILED';

  const getStepStatus = (index) => {
    if (isFailed) return 'failed';
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 border-green-600';
      case 'current':
        return 'bg-blue-600 border-blue-600 animate-pulse';
      case 'failed':
        return 'bg-red-600 border-red-600';
      default:
        return 'bg-gray-300 border-gray-300';
    }
  };

  const getLineColor = (index) => {
    if (isFailed) return 'bg-red-300';
    if (index < currentIndex) return 'bg-green-600';
    return 'bg-gray-300';
  };

  if (isFailed) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <div className="flex items-center">
          <span className="text-3xl mr-3">❌</span>
          <div>
            <h3 className="text-lg font-bold text-red-800">Delivery Failed</h3>
            <p className="text-red-700 text-sm">
              There was an issue with the delivery. Please contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Delivery Status</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <span className="font-semibold">Estimated Delivery:</span>{' '}
            {estimatedDate ? new Date(estimatedDate).toLocaleDateString() : 'Not set'}
          </div>
          {actualDate && (
            <div>
              <span className="font-semibold">Delivered On:</span>{' '}
              {new Date(actualDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="flex justify-between items-start">
          {statuses.map((status, index) => {
            const stepStatus = getStepStatus(index);
            const isLast = index === statuses.length - 1;

            return (
              <div key={status.key} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-white text-xl z-10 ${getStepColor(
                      stepStatus
                    )}`}
                  >
                    {status.icon}
                  </div>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        stepStatus === 'current'
                          ? 'text-blue-600'
                          : stepStatus === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {status.label}
                    </p>
                    {stepStatus === 'current' && (
                      <p className="text-xs text-gray-500 mt-1">Current Status</p>
                    )}
                    {stepStatus === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">✓ Completed</p>
                    )}
                  </div>
                </div>

                {/* Connecting Line */}
                {!isLast && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-1 ${getLineColor(
                      index
                    )} -z-0`}
                    style={{ transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          {deliveryStatus === 'PENDING' && (
            <>
              <strong>📦 Package Prepared:</strong> Your order has been shipped and is being
              prepared for transit.
            </>
          )}
          {deliveryStatus === 'IN_TRANSIT' && (
            <>
              <strong>🚚 On The Way:</strong> Your package is in transit and will arrive soon.
            </>
          )}
          {deliveryStatus === 'DELIVERED' && (
            <>
              <strong>✅ Delivered:</strong> Your package has been successfully delivered!
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default TrackingTimeline;
