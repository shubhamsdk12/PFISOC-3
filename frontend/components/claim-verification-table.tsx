"use client"

interface Claim {
  id: string
  claim_text: string
  pillar: string
  status: "Supporting" | "Contradicting" | "Neutral"
  evidence?: string
  confidence: number
}

interface ClaimVerificationTableProps {
  claims?: Claim[]
}

export default function ClaimVerificationTable({ claims = [] }: ClaimVerificationTableProps) {
  const displayClaims =
    claims.length > 0
      ? claims
      : [
          {
            id: "1",
            claim_text: "Carbon neutral by 2030",
            pillar: "Environment",
            status: "Supporting",
            evidence: "Third-party audit",
            confidence: 92,
          },
          {
            id: "2",
            claim_text: "Renewable energy 80%",
            pillar: "Environment",
            status: "Supporting",
            evidence: "Company report",
            confidence: 78,
          },
          {
            id: "3",
            claim_text: "Zero waste operations",
            pillar: "Environment",
            status: "Contradicting",
            evidence: "Internal data",
            confidence: 45,
          },
          {
            id: "4",
            claim_text: "Fair labor practices",
            pillar: "Social",
            status: "Supporting",
            evidence: "NGO verification",
            confidence: 88,
          },
          {
            id: "5",
            claim_text: "Scope 3 emissions tracked",
            pillar: "Governance",
            status: "Contradicting",
            evidence: "Unverified",
            confidence: 32,
          },
        ]

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case "Supporting":
        return "✅"
      case "Contradicting":
        return "❌"
      default:
        return "⚪"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-esg-success/20">
            <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Claim</th>
            <th className="text-left py-3 px-2 text-muted-foreground font-semibold">Pillar</th>
            <th className="text-center py-3 px-2 text-muted-foreground font-semibold">Status</th>
            <th className="text-right py-3 px-2 text-muted-foreground font-semibold">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {displayClaims.map((claim) => (
            <tr key={claim.id} className="border-b border-esg-success/10 hover:bg-muted/20 transition-colors">
              <td className="py-3 px-2 text-foreground">{claim.claim_text}</td>
              <td className="py-3 px-2 text-muted-foreground text-xs">{claim.pillar}</td>
              <td className="py-3 px-2 text-center text-lg">{getStatusEmoji(claim.status)}</td>
              <td className="py-3 px-2 text-right">
                <span
                  className="font-semibold"
                  style={{
                    color:
                      claim.confidence >= 70
                        ? "var(--esg-success)"
                        : claim.confidence >= 40
                          ? "var(--esg-warning)"
                          : "var(--esg-error)",
                  }}
                >
                  {claim.confidence.toFixed(0)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
