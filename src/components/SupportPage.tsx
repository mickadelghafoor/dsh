import React from 'react';
import { ArrowLeft, Mail, MessageCircle, Phone, Clock, ExternalLink } from 'lucide-react';

interface SupportPageProps {
  onBack: () => void;
}

const SupportPage: React.FC<SupportPageProps> = ({ onBack }) => {
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Support Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">How can we</span>{' '}
            <span className="text-yellow-400 glow-text">help you?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Get the support you need for DeltaSilicon.Hub. We're here to help you with any questions or issues.
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <Mail className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Email Support</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Send us an email and we'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => handleExternalLink('mailto:support@deltasilicon.hub')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              support@deltasilicon.hub
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <MessageCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Live Chat</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Chat with our support team in real-time for immediate assistance.
            </p>
            <button
              onClick={() => handleExternalLink('https://discord.gg/deltasilicon')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              Start Chat
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-yellow-400/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-400/10 rounded-lg">
                <Phone className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Phone Support</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Call us during business hours for urgent issues.
            </p>
            <button
              onClick={() => handleExternalLink('tel:+1-800-DELTA-HUB')}
              className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors duration-300"
            >
              +1-800-DELTA-HUB
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {[
              {
                question: "How do I enable captions?",
                answer: "Captions are automatically available in multiple languages when you start watching. Click the CC button in the video player to select your preferred language."
              },
              {
                question: "Why can't I watch certain content?",
                answer: "Content availability may vary by region and streaming service. Try switching to a different streaming service in Settings if content is not available."
              },
              {
                question: "How do I change streaming services?",
                answer: "Go to Settings > Streaming Service and select your preferred service from the dropdown menu. We support VidSrc, VidFast, VidLink, and Videasy."
              },
              {
                question: "Is my watch history saved?",
                answer: "Yes, your watch history is saved locally on your device when you're logged in. You can view and manage it in the History section."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Support Hours</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400 mb-1">Monday - Friday</div>
              <div className="text-white">9:00 AM - 6:00 PM PST</div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Weekend</div>
              <div className="text-white">10:00 AM - 4:00 PM PST</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;