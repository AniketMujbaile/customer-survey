import React, { useState, useEffect } from 'react';

const questions = [
  {
    id: 1,
    text: "How satisfied are you with our products?",
    type: "rating",
    min: 1,
    max: 5
  },
  {
    id: 2,
    text: "How fair are the prices compared to similar retailers?",
    type: "rating",
    min: 1,
    max: 5
  },
  {
    id: 3,
    text: "How satisfied are you with the value for money of your purchase?",
    type: "rating",
    min: 1,
    max: 5
  },
  {
    id: 4,
    text: "On a scale of 1-10 how would you recommend us to your friends and family?",
    type: "rating",
    min: 1,
    max: 10
  },
  {
    id: 5,
    text: "What could we do to improve our service?",
    type: "text"
  }
];

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const SurveyApp = () => {
  const [screen, setScreen] = useState('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sessionId, setSessionId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (screen === 'thank-you') {
      const timer = setTimeout(() => {
        setScreen('welcome');
        setCurrentQuestion(0);
        setAnswers({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const startSurvey = () => {
    setSessionId(generateSessionId());
    setScreen('survey');
  };

  const handleAnswer = (value) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);
    
    localStorage.setItem(`survey_${sessionId}_q${questions[currentQuestion].id}`, JSON.stringify({
      questionId: questions[currentQuestion].id,
      answer: value,
      timestamp: new Date().toISOString()
    }));
  };

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentQuestion === questions.length - 1) {
      setShowConfirmDialog(true);
    } else {
      setCurrentQuestion(prev => 
        direction === 'next' ? 
          Math.min(prev + 1, questions.length - 1) : 
          Math.max(prev - 1, 0)
      );
    }
  };

  const handleSubmit = () => {
    localStorage.setItem(`survey_${sessionId}_status`, 'COMPLETED');
    setShowConfirmDialog(false);
    setScreen('thank-you');
  };

  const RatingInput = ({ min, max, value, onChange }) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center my-4">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              w-10 h-10 
              sm:w-12 sm:h-12 
              rounded-full 
              text-sm sm:text-base 
              transition-all 
              hover:scale-105
              ${value === num ? 
                'bg-blue-600 text-white ring-2 ring-offset-2 ring-blue-600' : 
                'bg-white border-2 border-gray-300 hover:border-blue-600'}
            `}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                Welcome to our Survey
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                We value your feedback! Please take a moment to share your thoughts.
              </p>
            </div>
            <button 
              onClick={startSurvey}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-lg 
                transition-transform hover:scale-105 hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Survey
            </button>
          </div>
        );

      case 'survey':
        const question = questions[currentQuestion];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-sm sm:text-base font-medium text-blue-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
              <div className="text-sm text-gray-500">
                {currentQuestion + 1}/{questions.length}
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center">
                {question.text}
              </h2>
              
              {question.type === 'rating' ? (
                <RatingInput
                  min={question.min}
                  max={question.max}
                  value={answers[question.id]}
                  onChange={handleAnswer}
                />
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-4 text-base sm:text-lg border-2 border-gray-300 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      min-h-[100px] resize-none"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between mt-8 gap-4">
              <button
                onClick={() => handleNavigation('prev')}
                disabled={currentQuestion === 0}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-lg border-2 
                  transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 
                  ${currentQuestion === 0 
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                    : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
              >
                Previous
              </button>
              <button
                onClick={() => handleNavigation('next')}
                className="flex-1 sm:flex-none px-6 py-2 bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 
                  focus:ring-blue-500 focus:ring-offset-2"
              >
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        );

      case 'thank-you':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                Thank You!
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                We appreciate your valuable feedback.
              </p>
            </div>
            <p className="text-sm text-gray-500 animate-pulse">
              Redirecting to welcome screen...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-xl">
        <div className="p-4 sm:p-6 md:p-8">
          {renderScreen()}
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-2">Submit Survey</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your survey responses?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg
                  hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg
                  hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyApp;