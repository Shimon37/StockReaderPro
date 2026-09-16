interface Props {
  score: number
}

function scoreColor(score: number): string {
  if (score >= 70) return '#26a69a'
  if (score >= 50) return '#d9b545'
  return '#ef5350'
}

export function ScoreBadge({ score }: Props): React.JSX.Element {
  return (
    <span className="score-badge" style={{ backgroundColor: scoreColor(score) }}>
      {score}
    </span>
  )
}
