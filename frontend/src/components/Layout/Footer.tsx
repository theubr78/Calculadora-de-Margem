import React from 'react';
import Container from './Container';
import Typography from '../UI/Typography';
import Flex from './Flex';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-gray-700 mt-lg">
      <Container padding="md">
        <div className="py-lg">
          <Flex
            direction="col"
            align="center"
            gap="md"
            responsive={{ sm: { direction: 'row', justify: 'between' } }}
            className="w-full"
          >
            <div className="text-center sm:text-left">
              <Typography variant="h6" color="primary" weight="semibold">
                Calculadora de Margem OMIE
              </Typography>
              <Typography variant="body2" color="neutral" className="mt-xs">
                Sistema profissional para cálculo de margem de lucro
              </Typography>
            </div>
            
            <div className="text-center">
              <Typography variant="body2" color="neutral">
                &copy; 2025 Calculadora de Margem OMIE. Todos os direitos reservados.
              </Typography>
              <Typography variant="caption" color="neutral" className="mt-xs block">
                Desenvolvido para integração com a API OMIE
              </Typography>
            </div>
          </Flex>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;