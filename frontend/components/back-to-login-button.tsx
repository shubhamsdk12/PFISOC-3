"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft } from "lucide-react"

export function BackToLoginButton() {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleClick = () => {
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    setShowConfirm(false)
    router.push("/auth/login")
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="fixed top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-esg-accent/10 border border-esg-accent/30 text-esg-accent hover:bg-esg-accent/20 hover:border-esg-accent/50 transition-all duration-200 esg-glow-green text-sm font-medium"
        title="Go back to login"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Login
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-esg-card-bg border border-esg-accent/30 rounded-lg p-6 max-w-sm esg-glow-green">
            <h3 className="text-lg font-semibold text-esg-accent mb-2">Go back to login?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              You will be redirected to the login page. Any unsaved changes will be lost.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg border border-esg-accent/30 text-esg-accent hover:bg-esg-accent/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-esg-accent text-esg-dark-bg font-medium hover:bg-esg-accent/90 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
