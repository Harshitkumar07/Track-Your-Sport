import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../config/routes';

const Privacy = () => {
  const { isDark } = useTheme();
  const card = isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <Helmet>
        <title>Privacy Policy – {APP_CONFIG.appName}</title>
        <meta name="description" content={`Privacy Policy for ${APP_CONFIG.appName}. Learn how we collect, use and protect your data.`} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className={`text-sm ${muted}`}>Last updated: April 2026</p>
        </div>

        <div className={`rounded-2xl border p-8 space-y-6 ${card}`}>
          <Section title="1. Information We Collect">
            <p>When you use {APP_CONFIG.appName}, we may collect the following types of information:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and profile picture via Google or email authentication.</li>
              <li><strong>Usage Data:</strong> We collect anonymous analytics about page views, feature usage, and performance metrics to improve the service.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and screen resolution for optimization purposes.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our sports tracking service</li>
              <li>To personalize your experience and remember your preferences</li>
              <li>To send notifications about matches you follow (if opted in)</li>
              <li>To improve our platform and fix bugs</li>
              <li>To prevent abuse and enforce our Terms of Service</li>
            </ul>
          </Section>

          <Section title="3. Data Storage and Security">
            <p>Your data is stored securely using Google Firebase infrastructure. We use industry-standard encryption and security practices to protect your personal information. We do not sell, trade, or otherwise transfer your personal information to third parties.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Firebase (Google):</strong> Authentication, database, and hosting</li>
              <li><strong>CricData.org:</strong> Cricket match data and scores</li>
              <li><strong>API-Sports:</strong> Football, basketball, and other sports data</li>
            </ul>
            <p className="mt-2">Each of these services has their own privacy policies that govern how they handle data.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use essential cookies for authentication and preference storage. See our <a href="/cookies" className="text-blue-500 hover:underline">Cookie Policy</a> for more details.</p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your data</li>
              <li>Delete your account at any time</li>
            </ul>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </Section>

          <Section title="8. Contact Us">
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:contact@trackyoursport.com" className="text-blue-500 hover:underline">contact@trackyoursport.com</a>.</p>
          </Section>
        </div>
      </div>
    </>
  );
};

const Section = ({ title, children }) => {
  const { isDark } = useTheme();
  return (
    <div>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{children}</div>
    </div>
  );
};

export default Privacy;
