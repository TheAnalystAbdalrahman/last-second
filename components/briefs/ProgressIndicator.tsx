interface ProgressIndicatorProps {
  currentStep: number
  totalSteps?: number
}

export default function ProgressIndicator({
  currentStep,
  totalSteps = 3,
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
      }}
    >
      {steps.map((step, index) => {
        const isDone = step < currentStep
        const isActive = step === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: isDone || isActive ? '#000' : 'transparent',
                border: isDone || isActive ? 'none' : '1px solid #d1d5dc',
                flexShrink: 0,
              }}
            />
            {!isLast && (
              <div
                style={{
                  width: 80,
                  height: 1,
                  background: isDone ? '#000' : '#d1d5dc',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
