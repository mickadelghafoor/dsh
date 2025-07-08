import React from 'react';
import { Target, Users, Zap } from 'lucide-react';

const About = () => {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">About</span>{' '}
            <span className="text-yellow-400 glow-text">DeltaSilicon.Hub</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold mb-6 text-white">
              Revolutionizing Entertainment with Intelligence
            </h3>
            
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              At DeltaSilicon.Hub, we believe entertainment should be intelligent, seamless, and completely ad-free. 
              Our mission is to revolutionize how people discover and consume content by leveraging cutting-edge AI 
              technology and user-centric design.
            </p>

            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              Founded by tech visionaries who were frustrated with the current streaming landscape, we set out to 
              create a platform that truly understands what viewers want. No more endless scrolling, no more 
              interruptions, just pure entertainment tailored to your unique taste.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">2024</div>
                <div className="text-sm text-gray-400">Founded</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">50K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              
              <div className="text-center">
                <div className="inline-flex p-3 bg-yellow-400/10 rounded-lg mb-3">
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-yellow-400 glow-text">99.9%</div>
                <div className="text-sm text-gray-400">Uptime</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-8 rounded-2xl border border-gray-700 backdrop-blur-sm">
              <h4 className="text-2xl font-bold mb-6 text-yellow-400">Our Vision</h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Create the most intelligent streaming platform that understands individual preferences
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Eliminate ads completely while maintaining sustainable business model
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Support content creators with fair revenue sharing and creative freedom
                  </p>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p className="text-gray-300">
                    Build a global community united by quality entertainment
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;