import {
    AreaChart,
    Area,
    XAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"
import React from "react"

type Use = {
    entry_time: string
    exit_time: string | null
    user_full_name?: string
    kickable_activation_time?: string | null
}

function RoomUsageChart({
    usesToday,
}: {
    usesToday: Use[]
}) {
    const chartData = useMemo(() => {
        if (!usesToday || usesToday.length === 0) return []

        const startHour = 8
        const endHour = 21
        const now = Date.now()

        const parsedUses = usesToday.map((u) => ({
            entry: new Date(u.entry_time).getTime(),
            exit: u.exit_time ? new Date(u.exit_time).getTime() : now,
            user: u.user_full_name ?? "",
            kickable: u.kickable_activation_time
                ? new Date(u.kickable_activation_time).getTime()
                : null,
        }))

        const data: {
            time: string
            timestamp: number
            state: 0 | 1 | 2 | 3
            user: string
        }[] = []

        const start = new Date()
        start.setHours(startHour, 0, 0, 0)
        const end = new Date()
        end.setHours(endHour, 0, 0, 0)

        // Un point toutes les 5 minutes (fluide mais sans surcharge)
        for (let t = start.getTime(); t <= end.getTime(); t += 5 * 60 * 1000) {
            const time = new Date(t)
            const label = time.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
            })

            let state: 0 | 1 | 2 | 3 = 1 // Libre
            let user = ""

            if (t > now) {
                state = 0 // futur → libre par défaut
            } else {
                for (const u of parsedUses) {
                    if (t >= u.entry && t <= u.exit) {
                        state = 2 // Occupé
                        user = u.user
                        if (u.kickable && t >= u.kickable) state = 3 // Délogeable
                        break
                    }
                }
            }

            data.push({ time: label, timestamp: t, state, user })
        }

        return data
    }, [usesToday])

    // Données séparées par état
    const stateData = useMemo(
        () => ({
            free: chartData.map((d) => ({ ...d, value: d.state === 1 ? 1 : null })),
            occupied: chartData.map((d) => ({ ...d, value: d.state === 2 ? 2 : null })),
            kickable: chartData.map((d) => ({ ...d, value: d.state === 3 ? 3 : null })),
        }),
        [chartData]
    )

    return (
        <div className="p-4 bg-grey-2" style={{ height: 300, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="time"
                        tickFormatter={(v) => v.split(":")[0] + "h"}
                        ticks={chartData
                            .filter((d) => d.time.endsWith(":00")) // heures pleines
                            .map((d) => d.time)}
                        domain={['dataMin', 'dataMax']} // 👈 garantit 8h → 21h
                        tick={{ fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* 🟢 Libre */}
                    <Area
                        type="stepAfter"
                        dataKey="value"
                        data={stateData.free}
                        stroke="#16a34a"
                        fill="#16a34a"
                        isAnimationActive={false}
                        dot={false}
                        connectNulls
                    />
                    {/* 🔴 Occupé */}
                    <Area
                        type="stepAfter"
                        dataKey="value"
                        data={stateData.occupied}
                        stroke="#ef4444"
                        fill="#ef4444"
                        isAnimationActive={false}
                        dot={false}
                        connectNulls
                    />
                    {/* 🟠 Délogeable */}
                    <Area
                        type="stepAfter"
                        dataKey="value"
                        data={stateData.kickable}
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        isAnimationActive={false}
                        dot={false}
                        connectNulls
                    />
                </AreaChart>
            </ResponsiveContainer>


        </div>
    )
}

function CustomTooltip({ active, payload }: any) {
    if (active && payload && payload.length && payload[0].payload) {
        const data = payload[0].payload
        const status =
            data.state === 1
                ? "libre"
                : data.state === 2
                    ? "occupé"
                    : data.state === 3
                        ? "délogeable"
                        : "futur"

        const color =
            data.state === 1
                ? "text-green-dark"
                : data.state === 2
                    ? "text-red"
                    : data.state === 3
                        ? "text-orange-dark"
                        : "text-grey-dark"

        return (
            <div className="bg-white p-2 text-sm">
                <p>{data.time}</p>
                {data.user && <p className="font-semibold">{data.user}</p>}
                <p className={color}>status : {status}</p>
            </div>
        )
    }
    return null
}

export default React.memo(RoomUsageChart)
