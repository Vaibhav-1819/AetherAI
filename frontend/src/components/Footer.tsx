import { Link } from "react-router-dom"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 mt-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row mx-auto px-4">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by <a href="#" className="font-medium underline underline-offset-4 hover:text-primary transition-colors">AetherAI Team</a>.
          Powered by XGBoost & FastAPI.
        </p>
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/simulator" className="text-sm text-muted-foreground hover:text-primary transition-colors">Simulation</Link>
          <Link to="/optimizer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Optimizer</Link>
        </div>
      </div>
    </footer>
  )
}
