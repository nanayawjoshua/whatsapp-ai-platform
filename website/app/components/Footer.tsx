import { GiHoneypot } from 'react-icons/gi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="section-container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <GiHoneypot className="text-3xl text-beeline-yellow" />
            <span className="text-xl font-bold text-white">Beeline</span>
          </div>
          <div className="text-center md:text-right">
            <p>© 2025 Beeline Ghana. Built with Honey in Accra.</p>
            <p className="text-sm mt-2">
              Powered by Beeline 🐝
            </p>
            <p className="text-sm mt-1 text-gray-500">
              Building Africa's commerce graph — one message at a time
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
