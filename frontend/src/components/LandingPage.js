import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FiUsers, FiBriefcase, FiAward, FiMessageCircle, FiArrowRight, FiUser } from 'react-icons/fi';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      title: "Alumni Networking",
      description: "Connect with successful seniors and fellow graduates to grow your professional circle.",
      icon: <FiUsers className="w-6 h-6" />,
      color: "bg-blue-500"
    },
    {
      title: "Job Opportunities",
      description: "Access exclusive job postings shared by alumni and partner organizations.",
      icon: <FiBriefcase className="w-6 h-6" />,
      color: "bg-green-500"
    },
    {
      title: "Placement Support",
      description: "Get insights into placement drives, interview tips, and internship opportunities.",
      icon: <FiAward className="w-6 h-6" />,
      color: "bg-purple-500"
    },
    {
      title: "AI Assistant",
      description: "Ask our smart assistant anything about jobs, internships, or portal data.",
      icon: <FiMessageCircle className="w-6 h-6" />,
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Alumni Connect
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 font-semibold hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <FiUser /> Profile
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-6 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold tracking-wide uppercase">
            Bridging the gap between Seniors & Juniors
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Connect. Collaborate. <br />
            <span className="text-blue-600">Succeed Together.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The ultimate portal for alumni and students to share jobs, internships, 
            and career guidance. Join the community today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate(user ? '/dashboard' : '/auth')}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl hover:shadow-blue-200 flex items-center justify-center gap-2"
            >
              {user ? 'Go to Dashboard' : 'Get Started'} <FiArrowRight />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 border-2 border-gray-100 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need in one place
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform provides a comprehensive suite of tools to help you 
              stay connected and advance your career.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group"
              >
                <div className={`${feature.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-[3rem] p-12 text-white text-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">5000+</div>
                <div className="text-blue-100">Alumni Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1200+</div>
                <div className="text-blue-100">Jobs Posted</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">450+</div>
                <div className="text-blue-100">Companies</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">AI Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>© 2026 Alumni Connect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
