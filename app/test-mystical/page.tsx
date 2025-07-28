export default function TestMysticalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-amber-300">
          Test Mystical Feedback Page ✨
        </h1>
        <p className="text-gray-300 text-lg">
          Look for the debug elements and mystical feedback button!
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>• Red debug div in top-left corner (MysticalFeedback component)</p>
          <p>• Green debug div in top-right corner (Layout)</p>
          <p>• Purple-to-pink mystical button in bottom-left corner</p>
          <p>• All should be visible with highest z-index</p>
        </div>
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <p className="text-amber-300 text-sm">
            If you don't see the debug elements, there's a rendering issue.
            If you see them but not the mystical button, there's a CSS issue.
          </p>
        </div>
      </div>
    </div>
  )
} 