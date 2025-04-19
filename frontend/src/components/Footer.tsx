import { FC, useMemo } from 'react';

const Footer: FC = () => {
  const footerSections = useMemo(
    () => [
      {
        title: 'Customer Service',
        links: [
          { title: 'Contact Us', href: '/contact' },
          { title: 'Shipping Information', href: '/shipping' },
          { title: 'Returns & Exchanges', href: '/returns' },
          { title: 'FAQs', href: '/faqs' },
        ],
      },
      {
        title: 'Company',
        links: [
          { title: 'About Us', href: '/about' },
          { title: 'Careers', href: '/careers' },
          { title: 'Blog', href: '/blog' },
          { title: 'Press', href: '/press' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { title: 'Privacy Policy', href: '/privacy' },
          { title: 'Terms of Service', href: '/terms' },
          { title: 'Cookie Policy', href: '/cookies' },
        ],
      },
    ],
    []
  );

  return (
    <footer className="bg-heavenly-dark text-gray-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 space-y-4">
            <h2 className="text-2xl font-bold text-white">Heavenly</h2>
            <p className="text-sm">
              Elevating your shopping experience to divine heights.
            </p>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="text-white font-semibold uppercase text-sm mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <a
                      href={link.href}
                      aria-label={`Navigate to ${link.title}`}
                      className="text-sm hover:text-heavenly-gold transition-colors duration-300"
                    >
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Legal Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-wrap justify-center md:justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Heavenly. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center md:justify-start space-x-4 text-sm">
              <a href="/privacy" aria-label="Read our Privacy Policy" className="hover:text-heavenly-gold transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="/terms" aria-label="Read our Terms of Service" className="hover:text-heavenly-gold transition-colors duration-300">
                Terms of Service
              </a>
              <a href="/cookies" aria-label="Read our Cookie Policy" className="hover:text-heavenly-gold transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
