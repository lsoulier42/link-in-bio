import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12">
          <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-600 rounded-2xl p-8 mb-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase opacity-70 mb-2">Link in Bio</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
            <p className="mt-3 text-purple-200 text-sm">Last updated: August 2, 2026</p>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Data controller</h2>
            <p>
              This policy applies to <strong>Link in Bio</strong>, a link-in-bio web application
              that lets users create and share their own personalized link pages.
            </p>
            <p>
              For any question about privacy or personal data, use the contact address provided
              in the Contact section below.
            </p>

            <h2>2. Data we may process</h2>
            <p>Link in Bio only collects the data needed for the service to work:</p>
            <ul>
              <li>Email address and (hashed) password for administrator authentication.</li>
              <li>Profile information (display name, bio, avatar, links) provided voluntarily.</li>
              <li>Anonymous navigation data (link click counters).</li>
            </ul>

            <h2>3. Purposes of processing</h2>
            <ul>
              <li>Enabling users to create and manage personalized link pages.</li>
              <li>Displaying public pages to visitors.</li>
              <li>Providing click statistics to profile owners.</li>
              <li>Keeping the service secure and operational.</li>
            </ul>

            <h2>4. Retention and security</h2>
            <p>
              Data is kept for the duration of service usage. Passwords are hashed and never
              stored in plain text. We implement reasonable technical measures to protect data.
            </p>

            <h2>5. Your rights</h2>
            <p>
              You have the right to access, rectify, erase, and port your data. To exercise
              these rights, contact us at the address below.
            </p>

            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h2 className="mt-0">Contact</h2>
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@example.com">contact@example.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Footer />
        </div>
      </div>
    </div>
  );
}
