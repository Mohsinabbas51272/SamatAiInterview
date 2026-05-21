import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu } from 'lucide-react';

// react-icons
import { FaGithub, FaTwitter, FaEnvelope, FaCode } from 'react-icons/fa';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">

            <Link
              to="/"
              className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-slate-800"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <Cpu className="w-4 h-4 text-white" />
              </div>

              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Interview
              </span>
            </Link>

            <p className="text-sm text-slate-500 max-w-sm">
              AI-driven recruitment automation leveraging NLP, behavioral modeling, and candidate scoring to streamline hiring pipelines.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-400">

              <a href="#" className="hover:text-blue-600 transition-colors">
                <FaCode className="w-5 h-5" />
              </a>

              <a href="#" className="hover:text-blue-600 transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>

              <a href="#" className="hover:text-blue-600 transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>

              <a href="#" className="hover:text-blue-600 transition-colors">
                <FaEnvelope className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Solutions */}
          <div>
            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
              Solutions
            </h5>

            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li>
                <Link to="/candidate/dashboard" className="hover:text-blue-600 transition-colors">
                  Candidate Hub
                </Link>
              </li>

              <li>
                <Link to="/admin/dashboard" className="hover:text-blue-600 transition-colors">
                  Enterprise Admin
                </Link>
              </li>

              <li>
                <a href="#features" className="hover:text-blue-600 transition-colors">
                  Recruiting Analytics
                </a>
              </li>

              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Custom AI Tuning
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
              Legal & Contact
            </h5>

            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Security Standards</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Support Center</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Smart Interview Agent Inc. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Enterprise Recruitment Technology</p>
        </div>

      </div>
    </footer>
  );
};