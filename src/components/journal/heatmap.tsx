"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

interface HeatmapProps {
    dates: number[];
}

export function Heatmap({ dates }: HeatmapProps) {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    const { availableYears, months } = useMemo(() => {
        const counts = new Map<string, number>();
        const years = new Set<number>();

        dates.forEach(timestamp => {
            const date = new Date(timestamp);
            const key = date.toLocaleDateString('en-CA');
            counts.set(key, (counts.get(key) || 0) + 1);
            years.add(date.getFullYear());
        });

        years.add(new Date().getFullYear());
        const sortedYears = Array.from(years).sort((a, b) => b - a);

        // Generate Months for Selected Year
        const months = [];
        for (let m = 0; m < 12; m++) {
            const firstDay = new Date(selectedYear, m, 1);
            const lastDay = new Date(selectedYear, m + 1, 0);

            // We generate ALL months now to preserve layout structure
            const days = [];
            for (let d = 1; d <= lastDay.getDate(); d++) {
                const current = new Date(selectedYear, m, d);
                const key = current.toLocaleDateString('en-CA');
                const count = counts.get(key) || 0;
                days.push({ date: current, count, key });
            }
            months.push({
                name: firstDay.toLocaleString('default', { month: 'short' }).toUpperCase(),
                days
            });
        }

        return { availableYears: sortedYears, months };
    }, [dates, selectedYear]);

    const getColor = (count: number) => {
        if (count === 0) return "bg-gray-900 border border-gray-800";
        if (count < 2) return "bg-blue-900/40 border border-blue-900";
        if (count < 5) return "bg-blue-700 border border-blue-600";
        return "bg-blue-500 border border-blue-400";
    };

    return (
        <div className="w-full space-y-8">
            {/* Header / Year Selector */}
            <div className="flex justify-between items-center pb-4 border-b border-gray-800">
                <h2 className="text-gray-400 text-sm font-medium">Activity Log</h2>
                <div className="relative inline-block">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="appearance-none bg-gray-900 text-white pl-4 pr-10 py-1.5 rounded-lg border border-gray-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:border-gray-700 transition-colors"
                    >
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Monthly Rows */}
            <div className="space-y-6">
                {months.map((month) => (
                    <div key={month.name} className="flex gap-4">
                        {/* Label: Fixed & Centered */}
                        <div className="w-12 pt-1 flex justify-center">
                            <span className="text-[10px] font-bold text-gray-500 tracking-wider">
                                {month.name}
                            </span>
                        </div>

                        {/* Days Grid (15 cols) */}
                        <div className="flex-1 grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1.5 sm:gap-2 content-start">
                            {month.days.map((day) => (
                                <div
                                    key={day.key}
                                    className={clsx(
                                        "aspect-square rounded-[2px] transition-colors relative group",
                                        getColor(day.count)
                                    )}
                                >
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-700 pointer-events-none z-[60]">
                                        {day.count > 0 ? `${day.count} entries ` : 'No entries '}
                                        on {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="sticky bottom-0 py-4 mt-6 bg-black/80 backdrop-blur-sm border-t border-gray-800/50 flex items-center justify-center gap-2 text-xs text-gray-500 z-20">
                <span>Less</span>
                <div className="w-3 h-3 rounded-[1px] bg-gray-900 border border-gray-800" />
                <div className="w-3 h-3 rounded-[1px] bg-blue-900/40 border border-blue-900" />
                <div className="w-3 h-3 rounded-[1px] bg-blue-700 border border-blue-600" />
                <div className="w-3 h-3 rounded-[1px] bg-blue-500 border border-blue-400" />
                <span>More</span>
            </div>
        </div>
    );
}
