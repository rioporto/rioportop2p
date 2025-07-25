import { NodeSDK } from '@opentelemetry/sdk-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

// Configuração do SDK
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'rioporto-p2p',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  spanProcessor: new SimpleSpanProcessor(
    process.env.GRAFANA_ENDPOINT
      ? new OTLPTraceExporter({
          url: process.env.GRAFANA_ENDPOINT,
          headers: {
            Authorization: `Bearer ${process.env.GRAFANA_API_KEY}`,
          },
        })
      : new ConsoleSpanExporter() // Fallback para console em desenvolvimento
  ),
});

// Inicializar SDK
sdk.start();

// Garantir que o SDK é fechado na saída
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Telemetry SDK shut down successfully'))
    .catch((error) => console.log('Error shutting down Telemetry SDK', error))
    .finally(() => process.exit(0));
});

// Exportar função para logging de erros
export function logError(error: Error, context?: Record<string, any>) {
  const span = sdk.getTracer('error').startSpan('error');
  
  span.setAttributes({
    'error.type': error.name,
    'error.message': error.message,
    'error.stack': error.stack,
    ...context,
  });

  span.end();
}

// Exportar função para logging de eventos
export function logEvent(name: string, attributes?: Record<string, any>) {
  const span = sdk.getTracer('event').startSpan(name);
  
  if (attributes) {
    span.setAttributes(attributes);
  }

  span.end();
}

// Middleware para Next.js
export function withTelemetry(handler: any) {
  return async (req: any, res: any) => {
    const span = sdk.getTracer('http').startSpan(`${req.method} ${req.url}`);
    
    try {
      span.setAttributes({
        'http.method': req.method,
        'http.url': req.url,
        'http.user_agent': req.headers['user-agent'],
      });

      const result = await handler(req, res);

      span.setAttributes({
        'http.status_code': res.statusCode,
      });

      return result;
    } catch (error: any) {
      span.setAttributes({
        'error.type': error.name,
        'error.message': error.message,
        'error.stack': error.stack,
      });
      
      throw error;
    } finally {
      span.end();
    }
  };
} 