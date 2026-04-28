import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../contexts/ThemeContext';
import { APP_CONFIG } from '../config/routes';

const Terms = () => {
  const { isDark } = useTheme();
  const card = isDark ? 'bg-gray-800/80 border-gray-700/60' : 'bg-white border-gray-200';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <>
      <Helmet>
        <title>Terms of Service – {APP_CONFIG.appName}</title>
        <meta name="description" content={`Terms of Service for ${APP_CONFIG.appName}. Read our terms and conditions for using the platform.`} />
      </Helmet>

      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className={`text-sm ${muted}`}>Last updated: April 2026</p>
        </div>

        <div className={`rounded-2xl border p-8 space-y-6 ${card}`}>
          <Section title="1. Acceptance of Terms">
            <p>By accessing and using {APP_CONFIG.appName} ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use the Service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>{APP_CONFIG.appName} provides real-time sports scores, match information, and community features for various sports including cricket, football, basketball, and more. The Service aggregates data from third-party sports data providers.</p>
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc pl-5 space-y-1">
              <li>You may create an account using Google authentication or email/password</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must provide accurate and complete information when creating your account</li>
              <li>You must be at least 13 years old to use the Service</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use the Service for any unlawful purpose</li>
              <li>Post content that is offensive, abusive, or violates the rights of others</li>
              <li>Attempt to interfere with or disrupt the Service</li>
              <li>Scrape, crawl, or otherwise programmatically access the Service without permission</li>
              <li>Impersonate any person or entity</li>
              <li>Use the Service to distribute spam or unsolicited messages</li>
            </ul>
          </Section>

          <Section title="5. Intellectual Property">
            <p>The Service, including its design, logos, and content (excluding user-generated content and third-party sports data), is owned by {APP_CONFIG.appName} and protected by applicable intellectual property laws. Sports data is provided by third-party APIs and belongs to their respective owners.</p>
          </Section>

          <Section title="6. User-Generated Content">
            <p>When you post content (comments, discussions) on the Service:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You retain ownership of your content</li>
              <li>You grant us a non-exclusive license to display and distribute your content within the Service</li>
              <li>We may remove content that violates these terms</li>
              <li>You are solely responsible for the content you post</li>
            </ul>
          </Section>

          <Section title="7. Data Accuracy">
            <p>While we strive to provide accurate and up-to-date sports information, we rely on third-party data providers. We do not guarantee the accuracy, completeness, or timeliness of any sports data. The Service is provided for informational and entertainment purposes only.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>{APP_CONFIG.appName} is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of the Service. This includes, but is not limited to, damages from reliance on sports data for betting or financial decisions.</p>
          </Section>

          <Section title="9. Termination">
            <p>We reserve the right to terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through your profile settings.</p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms. We will notify users of significant changes.</p>
          </Section>

          <Section title="11. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:contact@trackyoursport.com" className="text-blue-500 hover:underline">contact@trackyoursport.com</a>.</p>
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

export default Terms;
