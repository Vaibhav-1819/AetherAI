import { CloudOff } from "lucide-react"

export function EmptyState({ title = "No Data Available", message = "The system could not retrieve the required metrics. Please check your backend connection." }) {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-2 ring-8 ring-secondary/20">
        <CloudOff size={40} className="text-muted-foreground/60" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground max-w-sm">
        {message}
      </p>
    </div>
  )
}
