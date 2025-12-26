const InterruptActionCard = ({ interruptData, onDecision }) => {
  const { interrupt_id, thread_id, requests } = interruptData;
  const request = requests[0]; // Assuming one action request per interrupt for simplicity

  // Friendly display mapping for tool inputs
  const formatEmailContent = (inputs) => {
    if (inputs.name !== 'send_email') {
      return formatInputs(inputs);
    }

    const { to, subject, body } = inputs.args;
    
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        {/* Email Header Styling */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="mb-2">
                <p className="text-xs font-medium text-gray-500 mb-1">To</p>
                <div className="flex flex-wrap gap-1">
                  {to.map((recipient, index) => (
                    <span key={index} className="bg-white px-2 py-1 rounded text-sm text-gray-700 border border-gray-200">
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                <p className="text-base font-semibold text-gray-900">{subject}</p>
              </div>
            </div>
            <div className="bg-white rounded-full p-2 shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Email Body with better styling */}
        <div className="px-4 py-4">
          <p className="text-xs font-medium text-gray-500 mb-3">MESSAGE</p>
          <div className="bg-white p-4 rounded-lg border border-gray-200 min-h-[120px]">
            <div className="prose prose-sm max-w-none">
              <pre className="text-gray-800 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {body}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fallback for other tools
  const formatInputs = (inputs) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Tool: {inputs.name}</p>
        <div className="bg-gray-50 p-3 rounded border">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
            {JSON.stringify(inputs.args, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="border border-yellow-400 bg-yellow-50 p-3 rounded-lg mt-2 shadow-sm">
      <h4 className="font-bold text-sm text-yellow-800 mb-1 flex items-center">
        ⚠️ Action Approval Required
      </h4>

      {/* Tool Details Section */}
      <div className="bg-white border p-2 rounded-md mb-3">
        {formatEmailContent(request)}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onDecision(interrupt_id, thread_id, true)}
          className="flex-1 bg-green-600 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-green-700 transition-colors"
        >
          Approve
        </button>
        <button
          onClick={() => onDecision(interrupt_id, thread_id, false)}
          className="flex-1 bg-red-600 text-white text-sm font-semibold py-1 px-3 rounded-full hover:bg-red-700 transition-colors"
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default InterruptActionCard;