interface PlaceholderProps {
    title: string
    description: string
    icon?: string
}

export function Placeholder({ title, description, icon = '⚽' }: PlaceholderProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl shadow-lg">
            <div className="text-5xl mb-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/50 shadow-inner">
                {icon}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Coming soon in later parts
            </div>
        </div>
    )
}
