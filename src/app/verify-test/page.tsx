export default function VerifyTestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Página de Verificação (Teste)
        </h1>
        <p style={{ color: '#666' }}>
          Se você está vendo esta página, o roteamento está funcionando corretamente.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
          Esta é uma página de teste sem client components ou hooks.
        </p>
      </div>
    </div>
  );
}