type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const c = {
  key:     '#9cdcfe',
  string:  '#ce9178',
  number:  '#b5cea8',
  keyword: '#569cd6',
  punct:   '#d4d4d4',
};

function JsonNode({ value, depth = 0 }: { value: JsonValue; depth?: number }) {
  if (value === null)             return <span style={{ color: c.keyword }}>null</span>;
  if (typeof value === 'boolean') return <span style={{ color: c.keyword }}>{String(value)}</span>;
  if (typeof value === 'number')  return <span style={{ color: c.number }}>{value}</span>;
  if (typeof value === 'string')  return <span style={{ color: c.string }}>"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: c.punct }}>[]</span>;
    return (
      <>
        <span style={{ color: c.punct }}>[</span>
        <div style={{ paddingLeft: '1.25em' }}>
          {value.map((item, i) => (
            <div key={i}>
              <JsonNode value={item} depth={depth + 1} />
              {i < value.length - 1 && <span style={{ color: c.punct }}>,</span>}
            </div>
          ))}
        </div>
        <span style={{ color: c.punct }}>]</span>
      </>
    );
  }

  const entries = Object.entries(value as Record<string, JsonValue>);
  if (entries.length === 0) return <span style={{ color: c.punct }}>{'{}'}</span>;
  return (
    <>
      <span style={{ color: c.punct }}>{'{'}</span>
      <div style={{ paddingLeft: '1.25em' }}>
        {entries.map(([k, v], i) => (
          <div key={k}>
            <span style={{ color: c.key }}>"{k}"</span>
            <span style={{ color: c.punct }}>: </span>
            <JsonNode value={v} depth={depth + 1} />
            {i < entries.length - 1 && <span style={{ color: c.punct }}>,</span>}
          </div>
        ))}
      </div>
      <span style={{ color: c.punct }}>{'}'}</span>
    </>
  );
}

export default function JsonViewer({ data }: { data: unknown }) {
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '0.85em',
      textAlign: 'left',
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      borderRadius: '6px',
      padding: '1rem',
      overflowX: 'auto',
      maxHeight: '400px',
      overflowY: 'auto',
      margin: '0.5rem 0',
    }}>
      <JsonNode value={data as JsonValue} />
    </div>
  );
}
