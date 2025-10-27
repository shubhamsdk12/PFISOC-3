"use client"

interface ExplainabilityPopupProps {
  onClose: () => void
}

export default function ExplainabilityPopup({ onClose }: ExplainabilityPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="esg-card-bg rounded-[10px] p-8 border border-esg-success/30 max-w-2xl w-full esg-glow-green">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold esg-text-green">🧠 Explainability</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-2xl">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold esg-text-green mb-2">Claim Context</h4>
            <p className="text-foreground text-sm">
              This company claims to achieve carbon neutrality by 2030 through renewable energy transition and carbon
              offset programs.
            </p>
          </div>

          <div>
            <h4 className="font-semibold esg-text-green mb-2">Supporting Evidence</h4>
            <ul className="text-foreground text-sm space-y-1">
              <li>✅ Third-party audit confirms 45% renewable energy usage</li>
              <li>✅ Signed renewable energy contracts for 35% additional capacity</li>
              <li>✅ Carbon offset program verified by independent auditor</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold esg-text-orange mb-2">Contradicting Evidence</h4>
            <ul className="text-foreground text-sm space-y-1">
              <li>❌ Scope 3 emissions not fully tracked</li>
              <li>❌ Supply chain emissions reduction plan unclear</li>
            </ul>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 mt-4">
            <h4 className="font-semibold esg-text-green mb-2">Smart Recommendation</h4>
            <p className="text-foreground text-sm">
              Increase third-party verification of emission claims next quarter. Focus on Scope 3 emissions tracking and
              supply chain transparency to strengthen credibility score.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2 bg-esg-success text-black hover:bg-esg-success/90 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
