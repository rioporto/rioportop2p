import { RegisterFormRealTime } from '@/components/forms/RegisterFormRealTime';

export default function RegisterRealTimePage() {
  return (
    <div className="register-container-premium">
      {/* Gradiente de fundo animado */}
      <div className="register-bg-gradient" />
      
      {/* Pattern de fundo */}
      <div className="register-bg-pattern" />
      
      {/* Container do formulário */}
      <div className="register-form-wrapper">
        <div className="register-form-content">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Crie sua conta
            </h1>
            <p className="text-gray-400">
              Validação em tempo real para uma experiência melhor
            </p>
          </div>
          
          {/* Formulário com validações em tempo real */}
          <RegisterFormRealTime />
          
          {/* Footer com links */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Já tem uma conta?{' '}
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Faça login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}