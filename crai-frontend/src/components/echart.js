"use client";

import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export default function EChart({ option, height = 300, className = "" }) {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chart = echarts.init(containerRef.current);
        chartRef.current = chart;
        const handleResize = () => chart.resize();
        window.addEventListener("resize", handleResize);
        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        return () => {
            window.removeEventListener("resize", handleResize);
            observer.disconnect();
            chart.dispose();
            chartRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (chartRef.current && option) {
            chartRef.current.setOption(option, true);
        }
    }, [option]);

    return <div ref={containerRef} className={className} style={{ width: "100%", height }} />;
}
