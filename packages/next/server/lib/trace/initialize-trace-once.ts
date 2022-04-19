import { warn } from '../../../build/output/log'
import {
  TraceConfig,
  TraceExporter,
  TraceExporterGrpc,
  TraceExporterHttp,
  TraceExporterProtobuf,
} from './trace-config'

/**
 * Create an instance of opentelemetry exporter based on configurations. Currently support grpc, http, protobuf.
 */
const buildExporter = (
  options: TraceExporterGrpc | TraceExporterHttp | TraceExporterProtobuf
) => {
  switch (options.type) {
    case 'grpc':
      const {
        OTLPTraceExporter: OTLPTraceExporterGrpc,
      }: typeof import('@opentelemetry/exporter-trace-otlp-grpc') = require('next/dist/compiled/@opentelemetry/exporter-trace-otlp-grpc')
      const {
        Metadata,
        credentials: gprcCreadentials,
      }: typeof import('@grpc/grpc-js') = require('@next/dist/compiled/@gprc/@grpc-js')

      const metadata = Object.entries(options.metadata ?? {}).reduce(
        (acc, [key, value]) => {
          acc.set(key, value)
          return acc
        },
        new Metadata()
      )

      const getBuffer = (value?: string) =>
        value ? Buffer.from(value, 'utf-8') : undefined

      const credentials = options.credentials
        ? gprcCreadentials.createSsl(
            getBuffer(options.credentials.rootCerts),
            getBuffer(options.credentials.privateKey),
            getBuffer(options.credentials.certChain)
          )
        : undefined

      return new OTLPTraceExporterGrpc({
        url: options.url,
        credentials,
        metadata,
      })
    case 'http':
      const {
        OTLPTraceExporter: OTLPTraceExporterHttp,
      }: typeof import('@opentelemetry/exporter-trace-otlp-http') = require('next/dist/compiled/@opentelemetry/exporter-trace-otlp-http')
      return new OTLPTraceExporterHttp(options)
    case 'protobuf':
      const {
        OTLPTraceExporter: OTLPTraceExporterProto,
      }: typeof import('@opentelemetry/exporter-trace-otlp-proto') = require('next/dist/compiled/@opentelemetry/exporter-trace-otlp-proto')
      return new OTLPTraceExporterProto(options)
    default:
      throw new Error(`Unexpected exporter type specified`)
  }
}

/**
 * Creates a span processor using specified exporter.
 *
 */
const buildSpanProcessor = (
  options: TraceExporter,
  exporter: import('@opentelemetry/sdk-trace-base').SpanExporter
) => {
  const {
    SimpleSpanProcessor,
    BatchSpanProcessor,
  }: typeof import('@opentelemetry/sdk-trace-base') = require('next/dist/compiled/@opentelemetry/sdk-trace-base')

  switch (options.spanProcessor.processorType) {
    case 'batch':
      return new BatchSpanProcessor(exporter, options.spanProcessor)
    case 'simple':
      return new SimpleSpanProcessor(exporter)
    default:
      throw new Error('Unexpected span processor type specified')
  }
}

/**
 * Initialize underlying trace bindings as global trace provider.
 * This should be called earliest as possible before starting any instrumentation.
 * Any trace sent before will not be collected.
 *
 * Initialization can occur only once per whole process lifecycle. Subsequent request
 * to initialize will be ignored regardless of different configuration options.
 */
export const initializeTraceOnce = (() => {
  const {
    NodeTracerProvider,
  }: typeof import('@opentelemetry/sdk-trace-node') = require('next/dist/compiled/@opentelemetry/sdk-trace-node')
  const {
    SimpleSpanProcessor,
    ConsoleSpanExporter,
  }: typeof import('@opentelemetry/sdk-trace-base') = require('next/dist/compiled/@opentelemetry/sdk-trace-base')
  const {
    Resource,
  }: typeof import('@opentelemetry/resources') = require('next/dist/compiled/@opentelemetry/resources')
  const {
    SemanticResourceAttributes,
  }: typeof import('@opentelemetry/semantic-conventions') = require('next/dist/compiled/@opentelemetry/semantic-conventions')

  let provider:
    | import('@opentelemetry/sdk-trace-node').NodeTracerProvider
    | null = null

  return (config: TraceConfig) => {
    if (!!provider) {
      warn('Trace provider is already initialized')
      return
    }

    provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      }),
    })

    if (config.enableDebugSpanProcessor) {
      provider.addSpanProcessor(
        new SimpleSpanProcessor(new ConsoleSpanExporter())
      )
    }

    config.exporters?.forEach((exporterConfig) => {
      const exporter = buildExporter(exporterConfig)
      const spanProcessor = buildSpanProcessor(exporterConfig, exporter)
      provider?.addSpanProcessor(spanProcessor)
    })

    provider.register()

    Array.from(['SIGTERM', 'SIGINT'] as const).forEach((sig) => {
      process.on(sig, () => {
        if (provider) {
          let instance = provider
          provider = null

          instance.shutdown().catch((e) => {
            warn('Failed to terminate trace', e.toString())
          })
        }
      })
    })
  }
})()
