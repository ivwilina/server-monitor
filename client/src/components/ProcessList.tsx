interface Process { name: string; status: string; }
interface Props { processes: Process[]; selected: string | null; onSelect: (name: string) => void; }

export default function ProcessList({ processes, selected, onSelect }: Props) {
  return (
    <ul>
      {processes.map(p => (
        <li key={p.name} onClick={() => onSelect(p.name)} style={{ fontWeight: p.name === selected ? 'bold' : 'normal', cursor: 'pointer' }}>
          {p.name} — {p.status}
        </li>
      ))}
    </ul>
  );
}
