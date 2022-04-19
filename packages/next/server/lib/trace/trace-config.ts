type SpanProcessorConfig =
  | {
      processorType: 'simple'
    }
  | {
      processorType: 'batch'
      exportTimeoutMs?: number
      maxExportBatchSize?: number
      maxQueueSize?: number
      scheduledDelayMs?: number
    }

// Base configuration option to specify `exporter` to process created span.
interface TraceExporter {
  url?: string
  spanProcessor: SpanProcessorConfig
}

interface TraceExporterGrpc extends TraceExporter {
  type: 'grpc'
  credentials?: {
    rootCerts?: string
    privateKey?: string
    certChain?: string
  }
  metadata?: Record<string, any>
}

interface TraceExporterHttp extends TraceExporter {
  type: 'http'
  headers?: Record<string, any>
  concurrencyLimit?: number
}

// protobuf via http
interface TraceExporterProtobuf extends TraceExporter {
  type: 'protobuf'
  headers?: Record<string, any>
}

interface TraceConfig {
  serviceName: string
  exporters?: Array<
    TraceExporterHttp | TraceExporterProtobuf | TraceExporterGrpc
  >
  enableDebugSpanProcessor?: boolean
}

export {
  SpanProcessorConfig,
  TraceConfig,
  TraceExporter,
  TraceExporterHttp,
  TraceExporterGrpc,
  TraceExporterProtobuf,
}
