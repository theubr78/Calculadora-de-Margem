import React, { useState } from 'react';
import Container from './Container';
import Typography from '../UI/Typography';

interface HeaderProps {
  showSubtitle?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  showSubtitle = true,
  className = ''
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`bg-surface shadow-sm border-b border-gray-700 ${className}`}>
      <Container padding="md">
        <div className="flex items-center justify-between py-sm sm:py-md">
          {/* Logo/Title Section */}
          <div className="flex items-center">
            <div className="flex flex-col">
              <Typography
                variant="h1"
                color="primary"
                weight="bold"
                className="text-h2 sm:text-h1 lg:text-display"
              >
                Calculadora de Margem
              </Typography>
              {showSubtitle && (
                <Typography
                  variant="body2"
                  color="neutral"
                  className="hidden sm:block mt-xs"
                >
                  Sistema profissional para cálculo de margem de lucro integrado ao OMIE
                </Typography>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-lg">
            <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors">
              Início
            </button>
            <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors">
              Produtos
            </button>
            <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors">
              Relatórios
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-xs"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-md border-t border-gray-700">
            <nav className="flex flex-col space-y-md">
              <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors py-sm text-left">
                Início
              </button>
              <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors py-sm text-left">
                Produtos
              </button>
              <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors py-sm text-left">
                Relatórios
              </button>
              <button className="text-body font-medium text-gray-400 hover:text-primary transition-colors py-sm text-left">
                Configurações
              </button>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;
