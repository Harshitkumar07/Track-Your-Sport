import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../config/routes';

const Cookies = () => {
  const { isDark } = useTheme();
  const card = isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <Helmet>
        <title>Cookie Policy – {APP_CONFIG.appName}</title>
        <meta name="description" content={`Cookie Policy for ${APP_CONFIG.appName}. Understand how we use cookies and similar technologies.`} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
          <p className={`text-sm ${muted}`}>Last updated: April 2026</p>
        </div>

        <div className={`rounded-2xl border p-8 space-y-6 ${card}`}>
          <Section title="1. What Are Cookies">
            <p>Cookies are small text files stored on your device when you visit a website. They are widely used to make websites work efficiently and provide information to site owners. {APP_CONFIG.appName} uses cookies and similar technologies to enhance your experience.</p>
          </Section>

          <Section title="2. Types of Cookies We Use">
            <div className="space-y-3 mt-2">
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <p className="font-semibold text-sm">Essential Cookies</p>
                <p className="text-xs mt-1">Required for authentication, session management, and security. These cannot be disabled as the Service cannot function without them.</p>
              </div>
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <p className="font-semibold text-sm">Preference Cookies</p>
                <p className="text-xs mt-1">Remember your settings such as theme (dark/light mode), preferred sports, and language preferences.</p>
              </div>
              <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                <p className="font-semibold text-sm">Performance Cookies</p>
                <p className="text-xs mt-1">Help us understand how visitors interact with the Service by collecting anonymous analytics data. This helps us improve performance and user experience.</p>
              </div>
            </div>
          </Section>

          <Section title="3. Third-Party Cookies">
            <p>Some cookies are set by third-party services we use:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Firebase (Google):</strong> Authentication tokens and session management</li>
              <li><strong>Google Analytics:</strong> Anonymous usage statistics (if enabled)</li>
            </ul>
          </Section>

          <Section title="4. Local Storage">
            <p>In addition to cookies, we use browser local storage to cache sports data and reduce API calls. This cached data includes match scores, fixtures, and series information. Cached data is automatically refreshed and does not contain personal information.</p>
          </Section>

          <Section title="5. Managing Cookies">
            <p>You can control cookies through your browser settings. Most browsers allow you to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>View and delete existing cookies</li>
              <li>Block all or specific cookies</li>
              <li>Set preferences for certain websites</li>
            </ul>
            <p className="mt-2">Please note that disabling essential cookies may prevent you from using certain features of the Service, such as logging in or saving preferences.</p>
          </Section>

          <Section title="6. Changes to This Policy">
            <p>We may update this Cookie Policy periodically. Changes will be posted on this page with an updated revision date.</p>
          </Section>

          <Section title="7. Contact">
            <p>If you have questions about our use of cookies, contact us at <a href="mailto:contact@trackyoursport.com" className="text-blue-500 hover:underline">contact@trackyoursport.com</a>.</p>
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

export default Cookies;
