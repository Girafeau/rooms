type ScoreBarProps = {
    score: number
    maxScore?: number
  }
  
  export function ScoreBar({ score, maxScore = 10 }: ScoreBarProps) {
    // largeur en pourcentage
    const widthPercent = Math.min(Math.max((score / maxScore) * 100, 0), 100)
  
    // couleur selon score
    let colorClass = "bg-blue"
    if (score <= 3) colorClass = "bg-red"
    else if (score > 3 && score <= 6) colorClass = "bg-orange"
  
    return (
        <div className="w-full bg-grey overflow-hidden relative">
        <div
          className={`${colorClass} px-4 py-2 h-full transition-all duration-300 flex items-center justify-center `}
          style={{ width: `${widthPercent}%` }}
        >
          <span className={` font-semibold`}>
            {score}
          </span>
        </div>
      </div>
    )
  }
  