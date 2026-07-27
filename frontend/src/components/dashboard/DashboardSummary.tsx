'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, FileText, Landmark } from 'lucide-react'
import { api } from '@/lib/api'
import { formatCurrencyBRL } from '@/lib/formatters'
import type { FinancialTitle } from '@/types/financeiro'
import type { RedeReceivable } from '@/types/rede'
import { DashboardMetricCard } from './DashboardMetricCard'

import styles from './DashboardSummary.module.css'

type ChartPoint = {
    label: string
    primary: number
    secondary: number
}

type AreaChartCardProps = {
    title: string
    subtitle: string
    primaryLabel: string
    secondaryLabel: string
    primaryValue: string
    secondaryValue: string
    data: ChartPoint[]
    chartType?: 'area' | 'bar'
    valueFormatter?: (value: number) => string
}

type ChartTooltip = {
    label: string
    primary: number
    secondary: number
    x: number
    y: number
}

export function DashboardSummary() {
    const [titles, setTitles] = useState<FinancialTitle[]>([])
    const [receivables, setReceivables] = useState<RedeReceivable[]>([])
    const [error, setError] = useState<string>()

    useEffect(() => {
        void Promise.all([
            api.list<FinancialTitle>('/financial-titles', { limit: 100 }),
            api.list<RedeReceivable>('/gateways/rede/receivables', { limit: 100 })
        ]).then(([titleResult, receivableResult]) => {
            setTitles(titleResult.data)
            setReceivables(receivableResult.data)
        }).catch((requestError) => {
            setError(requestError instanceof Error ? requestError.message : 'Falha ao carregar dashboard')
        })
    }, [])

    const openTotal = titles.filter((item) => item.status === 'OPEN').reduce((sum, item) => sum + Number(item.grossAmount), 0)
    const receivedTotal = receivables.reduce((sum, item) => sum + Number(item.netAmount ?? item.grossAmount), 0)
    const reconciledTitles = titles.filter((item) => item.status === 'RECONCILED')
    const titleChartData = buildTitleChartData(titles)
    const financialChartData = buildFinancialChartData(titles, receivables)

    return (
        <>
            {error ? <div className="mb-4 rounded-md border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-sm text-[var(--app-danger-text)]">{error}</div> : null}
            <div className="grid mt-10 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardMetricCard label="Total de títulos" value={String(titles.length)} icon={<FileText size={24} />} />
                <DashboardMetricCard label="Total em aberto" value={formatCurrencyBRL(openTotal)} icon={<AlertTriangle size={24} />} />
                <DashboardMetricCard
                    label="Total conciliado"
                    value={String(reconciledTitles.length)}
                    icon={<CheckCircle2 size={24} />}
                />
                <DashboardMetricCard label="Recebido Rede" value={formatCurrencyBRL(receivedTotal)} icon={<Landmark size={24} />} />
            </div>
            <div className="mt-10 grid gap-1 xl:grid-cols-2">
                <AreaChartCard
                    title="Títulos"
                    subtitle="Total dos últimos 7 dias"
                    primaryLabel="Total"
                    secondaryLabel="Conciliados"
                    primaryValue={String(titles.length)}
                    secondaryValue={String(reconciledTitles.length)}
                    data={titleChartData}
                    chartType="bar"
                />
                <AreaChartCard
                    title="Valores financeiros"
                    subtitle="Total dos últimos 7 dias"
                    primaryLabel="Em aberto"
                    secondaryLabel="Recebido"
                    primaryValue={formatCurrencyBRL(openTotal)}
                    secondaryValue={formatCurrencyBRL(receivedTotal)}
                    data={financialChartData}
                    valueFormatter={formatCurrencyBRL}
                />
            </div>
        </>
    )
}

function AreaChartCard({
    title,
    subtitle,
    primaryLabel,
    secondaryLabel,
    primaryValue,
    secondaryValue,
    data,
    chartType = 'area',
    valueFormatter = (value) => String(Math.round(value))
}: AreaChartCardProps) {
    const chart = buildSvgChart(data, title)
    const [tooltip, setTooltip] = useState<ChartTooltip>()
    const tooltipWidth = 188
    const tooltipHeight = 82
    const tooltipX = tooltip ? Math.min(Math.max(tooltip.x > 480 ? tooltip.x - tooltipWidth - 14 : tooltip.x + 14, 12), 640 - tooltipWidth - 12) : 0
    const tooltipY = tooltip ? Math.min(Math.max(tooltip.y - 58, 8), 260 - tooltipHeight - 8) : 0

    return (
        // <section className="overflow-hidden rounded-md bg-transparent">
        <section className={styles.section}>
            <div className={`${styles.informationBoard} ${styles.chartCard}`}>
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--app-text)]">{title}</h2>
                        <p className="mt-1 text-xs text-[var(--app-muted)]">{subtitle}</p>
                    </div>
                    <div className="flex rounded-md border border-white/40 bg-slate-950/45 p-0.5 text-[11px] font-semibold text-white">
                        <span className="rounded px-2.5 py-1">Últimos 3 meses</span>
                        <span className="rounded border-l border-[var(--app-border-strong)] px-2.5 py-1">30 dias</span>
                        <span className="rounded bg-[#1F6FFF] px-2.5 py-1 text-white">7 dias</span>
                    </div>
                </div>

                <div className="absolute inset-x-4 bottom-3 top-24">
                    <svg
                        className="h-full w-full"
                        viewBox="0 0 640 260"
                        role="img"
                        aria-label={`${title}: ${subtitle}`}
                        preserveAspectRatio="none"
                        onMouseLeave={() => setTooltip(undefined)}
                    >
                        <defs>
                            <linearGradient id={`${chart.id}-primary`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#4386FF" stopOpacity="0.36" />
                                <stop offset="62%" stopColor="#1F6FFF" stopOpacity="0.14" />
                                <stop offset="100%" stopColor="#0C3F9E" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={`${chart.id}-secondary`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#D4DAE7" stopOpacity="0.28" />
                                <stop offset="62%" stopColor="#9BA6BD" stopOpacity="0.11" />
                                <stop offset="100%" stopColor="#4C586F" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id={`${chart.id}-title-bar-primary`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#4386FF" />
                                <stop offset="45%" stopColor="#1F6FFF" />
                                <stop offset="100%" stopColor="#0C3F9E" />
                            </linearGradient>
                            <linearGradient id={`${chart.id}-title-bar-secondary`} x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#D4DAE7" />
                                <stop offset="45%" stopColor="#9BA6BD" />
                                <stop offset="100%" stopColor="#4C586F" />
                            </linearGradient>
                        </defs>
                        {[28, 67.2, 106.4, 145.6, 184.8, 224].map((y) => (
                            <line key={y} x1="20" x2="720" y1={y} y2={y} stroke="var(--app-chart-grid)" strokeWidth="1" opacity="1" />
                        ))}
                        {chartType === 'area' ? (
                            <>
                                <path d={chart.secondaryAreaPath} fill={`url(#${chart.id}-secondary)`} />
                                <path d={chart.primaryAreaPath} fill={`url(#${chart.id}-primary)`} />
                                <path d={chart.secondaryLinePath} fill="none" stroke="#AAB3C7" strokeWidth="3" opacity="0.95" strokeLinecap="round" />
                                <path d={chart.primaryLinePath} fill="none" stroke="#1F6FFF" strokeWidth="3" opacity="0.95" strokeLinecap="round" />
                            </>
                        ) : null}
                        {tooltip && chartType === 'area' ? (
                            <line x1={tooltip.x} x2={tooltip.x} y1={chart.top} y2={chart.bottom} stroke="#E2E8F0" strokeWidth="1" />
                        ) : null}
                        {chart.points.map((point) => (
                            <g key={point.label}>
                                <text x={point.x} y="244" textAnchor="middle" fill="var(--chart-label)" className="text-[11px]">
                                    {point.label}
                                </text>
                            </g>
                        ))}
                        {chartType === 'bar'
                            ? chart.points.map((point) => {
                                const barWidth = 28
                                const gap = 1
                                const primaryX = point.x - barWidth - gap / 2
                                const secondaryX = point.x + gap / 2
                                const primaryHeight = chart.bottom - point.primaryY
                                const secondaryHeight = chart.bottom - point.secondaryY
                                const barDepthX = 8
                                const barDepthY = 7
                                const tooltipYPoint = Math.min(point.primaryY, point.secondaryY)

                                return (
                                    <g key={`${point.label}-bars`}>
                                        <Bar3D
                                            x={primaryX}
                                            y={point.primaryY}
                                            width={barWidth}
                                            height={primaryHeight}
                                            depthX={barDepthX}
                                            depthY={barDepthY}
                                            frontFill={`url(#${chart.id}-title-bar-primary)`}
                                            topFill="#76A5FF"
                                            sideFill="#0C3F9E"
                                        />
                                        <Bar3D
                                            x={secondaryX}
                                            y={point.secondaryY}
                                            width={barWidth}
                                            height={secondaryHeight}
                                            depthX={barDepthX}
                                            depthY={barDepthY}
                                            frontFill={`url(#${chart.id}-title-bar-secondary)`}
                                            topFill="#EEF1F7"
                                            sideFill="#4C586F"
                                        />
                                        <rect
                                            x={primaryX - 3}
                                            y={Math.min(point.primaryY, point.secondaryY) - barDepthY - 6}
                                            width={(barWidth * 2) + gap + barDepthX + 6}
                                            height={Math.max(primaryHeight, secondaryHeight) + barDepthY + 12}
                                            fill="transparent"
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`${primaryLabel} e ${secondaryLabel} em ${point.label}`}
                                            onFocus={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: tooltipYPoint })}
                                            onBlur={() => setTooltip(undefined)}
                                            onMouseEnter={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: tooltipYPoint })}
                                        />
                                    </g>
                                )
                            })
                            : chart.points.map((point) => (
                                <g key={`${point.label}-points`}>
                                    <circle cx={point.x} cy={point.primaryY} r="4" fill="#1F6FFF" />
                                    <circle
                                        cx={point.x}
                                        cy={point.primaryY}
                                        r="12"
                                        fill="transparent"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${primaryLabel} em ${point.label}: ${valueFormatter(point.primary)}`}
                                        onFocus={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: point.primaryY })}
                                        onBlur={() => setTooltip(undefined)}
                                        onMouseEnter={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: point.primaryY })}
                                    />
                                    <circle cx={point.x} cy={point.secondaryY} r="4" fill="#AAB3C7" />
                                    <circle
                                        cx={point.x}
                                        cy={point.secondaryY}
                                        r="12"
                                        fill="transparent"
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`${secondaryLabel} em ${point.label}: ${valueFormatter(point.secondary)}`}
                                        onFocus={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: point.secondaryY })}
                                        onBlur={() => setTooltip(undefined)}
                                        onMouseEnter={() => setTooltip({ label: point.label, primary: point.primary, secondary: point.secondary, x: point.x, y: point.secondaryY })}
                                    />
                                </g>
                            ))}
                        {tooltip ? (
                            <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight} pointerEvents="none">
                                <div className="rounded-md bg-black/90 px-3 py-2 text-[11px] text-white shadow-lg">
                                    <p className="mb-1 font-semibold">{tooltip.label}</p>
                                    <p className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-sm bg-[#1F6FFF]" />
                                        <span className="min-w-0 flex-1 truncate">{primaryLabel}</span>
                                        <span className="pl-3 font-semibold">{valueFormatter(tooltip.primary)}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-sm bg-[#AAB3C7]" />
                                        <span className="min-w-0 flex-1 truncate">{secondaryLabel}</span>
                                        <span className="pl-3 font-semibold">{valueFormatter(tooltip.secondary)}</span>
                                    </p>
                                </div>
                            </foreignObject>
                        ) : null}
                    </svg>
                </div>
            </div>
        </section>
    )
}

function Bar3D({
    x,
    y,
    width,
    height,
    depthX,
    depthY,
    frontFill,
    topFill,
    sideFill
}: {
    x: number
    y: number
    width: number
    height: number
    depthX: number
    depthY: number
    frontFill: string
    topFill: string
    sideFill: string
}) {
    const bottom = y + height
    const topPath = `${x},${y} ${x + depthX},${y - depthY} ${x + width + depthX},${y - depthY} ${x + width},${y}`
    const sidePath = `${x + width},${y} ${x + width + depthX},${y - depthY} ${x + width + depthX},${bottom - depthY} ${x + width},${bottom}`

    return (
        <g>
            <polygon points={topPath} fill={topFill} opacity="0.96" />
            <polygon points={sidePath} fill={sideFill} opacity="0.88" />
            <rect x={x} y={y} width={width} height={height} rx="3" fill={frontFill} />
            <line x1={x + width} x2={x + width + depthX} y1={y} y2={y - depthY} stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        </g>
    )
}

function buildTitleChartData(titles: FinancialTitle[]): ChartPoint[] {
    const days = getChartDays(titles.map((item) => item.dueDate || item.createdAt))

    return days.map((day) => {
        const dayTime = endOfDay(day).getTime()
        const total = titles.filter((item) => new Date(item.dueDate || item.createdAt).getTime() <= dayTime).length
        const reconciled = titles.filter((item) => item.status === 'RECONCILED' && new Date(item.dueDate || item.updatedAt).getTime() <= dayTime).length

        return {
            label: formatShortDay(day),
            primary: total,
            secondary: reconciled
        }
    })
}

function buildFinancialChartData(titles: FinancialTitle[], receivables: RedeReceivable[]): ChartPoint[] {
    const days = getChartDays([
        ...titles.map((item) => item.dueDate || item.createdAt),
        ...receivables.map((item) => item.actualPaymentDate || item.expectedPaymentDate || item.createdAt)
    ])

    return days.map((day) => {
        const dayTime = endOfDay(day).getTime()
        const open = titles
            .filter((item) => item.status === 'OPEN' && new Date(item.dueDate || item.createdAt).getTime() <= dayTime)
            .reduce((sum, item) => sum + toNumber(item.grossAmount), 0)
        const received = receivables
            .filter((item) => new Date(item.actualPaymentDate || item.expectedPaymentDate || item.createdAt).getTime() <= dayTime)
            .reduce((sum, item) => sum + toNumber(item.netAmount ?? item.grossAmount), 0)

        return {
            label: formatShortDay(day),
            primary: open,
            secondary: received
        }
    })
}

function buildSvgChart(data: ChartPoint[], title: string) {
    const id = `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const dataTop = 56
    const bottom = 224
    const left = 24
    const right = 584
    const maxValue = Math.max(1, ...data.flatMap((item) => [item.primary, item.secondary]))
    const points = data.map((item, index) => {
        const x = data.length === 1 ? (left + right) / 2 : left + ((right - left) * index) / (data.length - 1)
        const primaryY = bottom - (item.primary / maxValue) * (bottom - dataTop)
        const secondaryY = bottom - (item.secondary / maxValue) * (bottom - dataTop)

        return {
            label: item.label,
            primary: item.primary,
            secondary: item.secondary,
            x,
            primaryY,
            secondaryY
        }
    })

    const primaryLinePath = buildSmoothPath(points.map((point) => [point.x, point.primaryY]))
    const secondaryLinePath = buildSmoothPath(points.map((point) => [point.x, point.secondaryY]))

    return {
        id,
        top: dataTop,
        bottom,
        points,
        primaryLinePath,
        secondaryLinePath,
        primaryAreaPath: `${primaryLinePath} L ${points[points.length - 1]?.x ?? right} ${bottom} L ${points[0]?.x ?? left} ${bottom} Z`,
        secondaryAreaPath: `${secondaryLinePath} L ${points[points.length - 1]?.x ?? right} ${bottom} L ${points[0]?.x ?? left} ${bottom} Z`
    }
}

function buildSmoothPath(points: Array<[number, number]>) {
    if (!points.length) return ''
    if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`

    return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point[0]} ${point[1]}`

        const previous = points[index - 1]
        const controlX = (previous[0] + point[0]) / 2
        return `${path} C ${controlX} ${previous[1]}, ${controlX} ${point[1]}, ${point[0]} ${point[1]}`
    }, '')
}

function getChartDays(values: Array<string | null | undefined>) {
    const dates = values
        .map((value) => value ? new Date(value) : undefined)
        .filter((value): value is Date => value instanceof Date && !Number.isNaN(value.getTime()))
    const maxDate = dates.length ? new Date(Math.max(...dates.map((date) => date.getTime()))) : new Date()
    const days = Array.from({ length: 7 }, (_, index) => {
        const day = new Date(maxDate)
        day.setDate(maxDate.getDate() - (6 - index))
        day.setHours(0, 0, 0, 0)
        return day
    })

    return days
}

function endOfDay(date: Date) {
    const next = new Date(date)
    next.setHours(23, 59, 59, 999)
    return next
}

function formatShortDay(date: Date) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date)
}

function toNumber(value?: string | number | null) {
    const parsed = Number(value ?? 0)
    return Number.isFinite(parsed) ? parsed : 0
}
