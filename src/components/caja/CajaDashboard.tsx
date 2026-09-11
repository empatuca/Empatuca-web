import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  PieChart as PieIcon, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  CheckCircle2, 
  Layers, 
  Receipt,
  HelpCircle,
  Filter,
  Compass
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from "recharts";
import { 
  formatOrderNumber, 
  formatEcuadorDate, 
  formatEcuadorTime, 
  getEcuadorDateString,
  getEcuadorDayRange 
} from "../../lib/utils";
import { obtenerEstadisticasOrigen } from "../../lib/encuestaService";

interface CajaDashboardProps {
  orders: any[];
  allGastos: any[];
  selectedDate: string;
  onSelectDate?: (date: string) => void;
}

type TimeRangeOption = '7d' | '14d' | '30d' | 'month' | 'today' | 'all';

const EXPENSE_COLORS: Record<string, string> = {
  'Operativo': '#3b82f6', // blue-500
  'Insumos / Producción': '#10b981', // emerald-500
  'Pago Socios (Socio 1)': '#ec4899', // pink-500
  'Pago Socios (Socio 2)': '#a855f7', // purple-500
  'Pago Socios (Socio 3)': '#8b5cf6', // violet-500
  'Servicios Básicos': '#f59e0b', // amber-500
  'Otros': '#6b7280' // gray-500
};

export default function CajaDashboard({ orders, allGastos, selectedDate, onSelectDate }: CajaDashboardProps) {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('7d');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [origenStats, setOrigenStats] = useState<Record<string, number>>({});

  useEffect(() => {
    obtenerEstadisticasOrigen().then(stats => setOrigenStats(stats));
  }, []);

  // Filter orders and expenses based on selected timeRange
  const { filteredOrders, filteredGastos, dateRangeLabel } = useMemo(() => {
    const todayStr = getEcuadorDateString();
    const todayTs = new Date(`${todayStr}T12:00:00-05:00`).getTime();

    let startDate: Date | null = null;
    let endDate = new Date(`${todayStr}T23:59:59.999-05:00`);
    let label = '';

    if (timeRange === 'today') {
      const { startOfDayUTC, endOfDayUTC } = getEcuadorDayRange(selectedDate || todayStr);
      startDate = new Date(startOfDayUTC);
      endDate = new Date(endOfDayUTC);
      label = `Día ${formatEcuadorDate(selectedDate || todayStr)}`;
    } else if (timeRange === '7d') {
      startDate = new Date(todayTs - 6 * 24 * 60 * 60 * 1000);
      label = 'Últimos 7 días';
    } else if (timeRange === '14d') {
      startDate = new Date(todayTs - 13 * 24 * 60 * 60 * 1000);
      label = 'Últimos 14 días';
    } else if (timeRange === '30d') {
      startDate = new Date(todayTs - 29 * 24 * 60 * 60 * 1000);
      label = 'Últimos 30 días';
    } else if (timeRange === 'month') {
      const d = new Date(`${todayStr}T12:00:00-05:00`);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      startDate = new Date(`${y}-${mStr}-01T00:00:00-05:00`);
      label = 'Mes en curso';
    } else {
      startDate = null; // all
      label = 'Todo el historial';
    }

    const startMs = startDate ? startDate.getTime() : 0;
    const endMs = endDate.getTime();

    const validOrders = orders.filter(o => {
      if (o.estado === 'cancelado' || o.estado === 'rechazado') return false;
      const t = new Date(o.created_at || Date.now()).getTime();
      if (startDate && t < startMs) return false;
      if (t > endMs) return false;
      return true;
    });

    const validGastos = allGastos.filter(g => {
      const t = new Date(g.created_at || Date.now()).getTime();
      if (startDate && t < startMs) return false;
      if (t > endMs) return false;
      return true;
    });

    return {
      filteredOrders: validOrders,
      filteredGastos: validGastos,
      dateRangeLabel: label
    };
  }, [orders, allGastos, timeRange, selectedDate]);

  // Overall Financial KPIs
  const totalIngresos = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + Math.round(Number(o.total || 0) * 100), 0) / 100;
  }, [filteredOrders]);

  const totalGastosMonto = useMemo(() => {
    return filteredGastos.reduce((sum, g) => sum + Math.round(Number(g.monto || 0) * 100), 0) / 100;
  }, [filteredGastos]);

  const saldoNeto = (Math.round(totalIngresos * 100) - Math.round(totalGastosMonto * 100)) / 100;
  const ticketPromedio = filteredOrders.length > 0 ? totalIngresos / filteredOrders.length : 0;

  // Breakdown of Gastos strictly as requested:
  // - Gasto Operativo
  // - Insumo / Producción
  // - Pago a Socios (Total and individually Socio 1, Socio 2, Socio 3)
  const expenseBreakdown = useMemo(() => {
    let gastoOperativo = 0;
    let countOperativo = 0;

    let gastoProduccion = 0;
    let countProduccion = 0;

    let socio1 = 0;
    let countSocio1 = 0;

    let socio2 = 0;
    let countSocio2 = 0;

    let socio3 = 0;
    let countSocio3 = 0;

    let otrosSocios = 0;
    let countOtrosSocios = 0;

    let serviciosBasicos = 0;
    let countServicios = 0;

    let otrosGastos = 0;
    let countOtros = 0;

    filteredGastos.forEach(g => {
      const monto = Number(g.monto || 0);
      const cat = (g.categoria || '').trim();

      if (cat.includes('Socio 1')) {
        socio1 += monto;
        countSocio1++;
      } else if (cat.includes('Socio 2')) {
        socio2 += monto;
        countSocio2++;
      } else if (cat.includes('Socio 3')) {
        socio3 += monto;
        countSocio3++;
      } else if (cat.toLowerCase().includes('socio')) {
        otrosSocios += monto;
        countOtrosSocios++;
      } else if (cat.toLowerCase().includes('producc') || cat.toLowerCase().includes('insumo')) {
        gastoProduccion += monto;
        countProduccion++;
      } else if (cat.toLowerCase().includes('servicio')) {
        serviciosBasicos += monto;
        countServicios++;
      } else if (cat.toLowerCase().includes('operativo')) {
        gastoOperativo += monto;
        countOperativo++;
      } else {
        otrosGastos += monto;
        countOtros++;
      }
    });

    const totalSocios = Math.round((socio1 + socio2 + socio3 + otrosSocios) * 100) / 100;
    const totalCalc = Math.max(0.001, totalGastosMonto);

    return {
      operativo: {
        total: Math.round(gastoOperativo * 100) / 100,
        count: countOperativo,
        pct: (gastoOperativo / totalCalc) * 100
      },
      produccion: {
        total: Math.round(gastoProduccion * 100) / 100,
        count: countProduccion,
        pct: (gastoProduccion / totalCalc) * 100
      },
      totalSocios: {
        total: totalSocios,
        count: countSocio1 + countSocio2 + countSocio3 + countOtrosSocios,
        pct: (totalSocios / totalCalc) * 100
      },
      socios: {
        socio1: { total: Math.round(socio1 * 100) / 100, count: countSocio1, pctOfTotal: (socio1 / totalCalc) * 100, pctOfSocios: totalSocios > 0 ? (socio1 / totalSocios) * 100 : 0 },
        socio2: { total: Math.round(socio2 * 100) / 100, count: countSocio2, pctOfTotal: (socio2 / totalCalc) * 100, pctOfSocios: totalSocios > 0 ? (socio2 / totalSocios) * 100 : 0 },
        socio3: { total: Math.round(socio3 * 100) / 100, count: countSocio3, pctOfTotal: (socio3 / totalCalc) * 100, pctOfSocios: totalSocios > 0 ? (socio3 / totalSocios) * 100 : 0 },
        otros: { total: Math.round(otrosSocios * 100) / 100, count: countOtrosSocios }
      },
      servicios: {
        total: Math.round(serviciosBasicos * 100) / 100,
        count: countServicios,
        pct: (serviciosBasicos / totalCalc) * 100
      },
      otros: {
        total: Math.round(otrosGastos * 100) / 100,
        count: countOtros,
        pct: (otrosGastos / totalCalc) * 100
      }
    };
  }, [filteredGastos, totalGastosMonto]);

  // Data for Sales Progress Chart (Daily Aggregations)
  const salesProgressData = useMemo(() => {
    if (timeRange === 'today') {
      // Group by hours (from 12:00 to 23:00)
      const hourlyMap: Record<number, { ventas: number; pedidos: number }> = {};
      for (let h = 12; h <= 23; h++) {
        hourlyMap[h] = { ventas: 0, pedidos: 0 };
      }

      filteredOrders.forEach(o => {
        const d = new Date(o.created_at || Date.now());
        // Hour in Ecuador (UTC-5)
        const ecHour = (d.getUTCHours() - 5 + 24) % 24;
        if (hourlyMap[ecHour] !== undefined) {
          hourlyMap[ecHour].ventas += Number(o.total || 0);
          hourlyMap[ecHour].pedidos += 1;
        }
      });

      return Object.entries(hourlyMap).map(([hour, val]) => ({
        label: `${hour}:00`,
        ventas: Math.round(val.ventas * 100) / 100,
        pedidos: val.pedidos
      }));
    }

    // Otherwise group by day
    const dayMap: Record<string, { ventas: number; gastos: number; pedidos: number; rawDate: string }> = {};

    // Populate past dates if 7d or 14d
    if (timeRange === '7d' || timeRange === '14d') {
      const countDays = timeRange === '7d' ? 7 : 14;
      const today = new Date();
      for (let i = countDays - 1; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        // format date in Ecuador
        const dateKey = d.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', month: '2-digit', day: '2-digit' });
        dayMap[dateKey] = { ventas: 0, gastos: 0, pedidos: 0, rawDate: dateKey };
      }
    }

    filteredOrders.forEach(o => {
      const d = new Date(o.created_at || Date.now());
      const dateKey = d.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', month: '2-digit', day: '2-digit' });
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { ventas: 0, gastos: 0, pedidos: 0, rawDate: dateKey };
      }
      dayMap[dateKey].ventas += Number(o.total || 0);
      dayMap[dateKey].pedidos += 1;
    });

    filteredGastos.forEach(g => {
      const d = new Date(g.created_at || Date.now());
      const dateKey = d.toLocaleDateString('es-EC', { timeZone: 'America/Guayaquil', month: '2-digit', day: '2-digit' });
      if (!dayMap[dateKey]) {
        dayMap[dateKey] = { ventas: 0, gastos: 0, pedidos: 0, rawDate: dateKey };
      }
      dayMap[dateKey].gastos += Number(g.monto || 0);
    });

    return Object.entries(dayMap).map(([key, val]) => ({
      label: key,
      ventas: Math.round(val.ventas * 100) / 100,
      gastos: Math.round(val.gastos * 100) / 100,
      pedidos: val.pedidos
    }));
  }, [filteredOrders, filteredGastos, timeRange]);

  // Data for Expense Distribution Pie Chart
  const expensePieData = useMemo(() => {
    const list: Array<{ name: string; value: number; color: string }> = [];

    if (expenseBreakdown.operativo.total > 0) {
      list.push({ name: 'Operativo', value: expenseBreakdown.operativo.total, color: EXPENSE_COLORS['Operativo'] });
    }
    if (expenseBreakdown.produccion.total > 0) {
      list.push({ name: 'Insumos / Producción', value: expenseBreakdown.produccion.total, color: EXPENSE_COLORS['Insumos / Producción'] });
    }
    if (expenseBreakdown.socios.socio1.total > 0) {
      list.push({ name: 'Pago Socio 1', value: expenseBreakdown.socios.socio1.total, color: EXPENSE_COLORS['Pago Socios (Socio 1)'] });
    }
    if (expenseBreakdown.socios.socio2.total > 0) {
      list.push({ name: 'Pago Socio 2', value: expenseBreakdown.socios.socio2.total, color: EXPENSE_COLORS['Pago Socios (Socio 2)'] });
    }
    if (expenseBreakdown.socios.socio3.total > 0) {
      list.push({ name: 'Pago Socio 3', value: expenseBreakdown.socios.socio3.total, color: EXPENSE_COLORS['Pago Socios (Socio 3)'] });
    }
    if (expenseBreakdown.servicios.total > 0) {
      list.push({ name: 'Servicios Básicos', value: expenseBreakdown.servicios.total, color: EXPENSE_COLORS['Servicios Básicos'] });
    }
    if (expenseBreakdown.otros.total > 0) {
      list.push({ name: 'Otros Egresos', value: expenseBreakdown.otros.total, color: EXPENSE_COLORS['Otros'] });
    }

    return list;
  }, [expenseBreakdown]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#5a0606]/10 text-[#5a0606]">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Dashboard Financiero & Ventas
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Visualización analítica del progreso de ventas y destino del dinero: operativo, insumos y pago a socios.
          </p>
        </div>

        {/* Time Horizon Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={() => {
                setTimeRange('today');
                onSelectDate?.(getEcuadorDateString());
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                timeRange === 'today' && selectedDate === getEcuadorDateString() ? 'bg-[#5a0606] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hoy
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                if (e.target.value) {
                  onSelectDate?.(e.target.value);
                  setTimeRange('today');
                }
              }}
              className="bg-transparent text-xs font-bold text-gray-800 outline-none cursor-pointer"
              title="Elegir fecha específica para revisar"
            />
          </div>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              timeRange === '7d' ? 'bg-[#5a0606] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 Días
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              timeRange === '14d' ? 'bg-[#5a0606] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            14 Días
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              timeRange === 'month' ? 'bg-[#5a0606] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              timeRange === 'all' ? 'bg-[#5a0606] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Historial
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ingresos Totales */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Ventas / Ingresos</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-[#5a0606]">
              ${totalIngresos.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido completado' : 'pedidos completados'}
            </p>
          </div>
        </div>

        {/* Egresos Totales */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Egresos</span>
            <span className="p-2 rounded-xl bg-red-50 text-red-500">
              <ArrowDownRight className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-red-600">
              ${totalGastosMonto.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">
              {filteredGastos.length} gastos registrados ({dateRangeLabel})
            </p>
          </div>
        </div>

        {/* Saldo Neto */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Saldo Neto (Utilidad)</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className={`text-3xl sm:text-4xl font-black ${saldoNeto >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${saldoNeto.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Ventas menos Egresos del período
            </p>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black text-gray-900">
              ${ticketPromedio.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 font-bold mt-1">
              Promedio generado por cada cliente
            </p>
          </div>
        </div>
      </div>

      {/* SALES PROGRESS CHART */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#5a0606]" />
              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Evolución y Progreso de Ventas ({dateRangeLabel})
              </h3>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Curva de facturación e ingresos en dólares
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                chartType === 'area' ? 'bg-[#5a0606] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Área
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                chartType === 'bar' ? 'bg-[#5a0606] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Barras
            </button>
          </div>
        </div>

        <div className="h-[300px] sm:h-[350px] w-full">
          {salesProgressData.length === 0 || salesProgressData.every(d => d.ventas === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-sm font-bold">No hay ventas registradas para este período</p>
              <p className="text-xs text-gray-400 mt-1">Los datos aparecerán tan pronto como se aprueben pedidos en caja.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={salesProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5a0606" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fac124" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '16px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '12px', 
                      fontWeight: 'bold',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}
                    formatter={(value: any, name: any) => [
                      name === 'ventas' ? `$${Number(value).toFixed(2)}` : value,
                      name === 'ventas' ? 'Ventas' : 'Pedidos'
                    ]}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="ventas" 
                    stroke="#5a0606" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorVentas)" 
                  />
                </AreaChart>
              ) : (
                <BarChart data={salesProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '16px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Ventas']}
                  />
                  <Bar dataKey="ventas" fill="#5a0606" radius={[8, 8, 0, 0]}>
                    {salesProgressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#5a0606' : '#7f1d1d'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECTION: DETALLE DE DESTINO DE GASTOS */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-red-500" /> Destino y Distribución de Egresos
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Desglose exacto de los valores totales destinados a Gasto Operativo, Insumos/Producción y Pago a Socios (Socio 1, Socio 2, Socio 3).
          </p>
        </div>

        {/* 3 Core Destination Pillars: Operativo, Insumos, Socios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. GASTO OPERATIVO */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-xl">
                  Gasto Operativo
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.operativo.count} gastos
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-blue-900">
                ${expenseBreakdown.operativo.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-blue-700">{expenseBreakdown.operativo.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Gastos diarios de funcionamiento, limpieza y mantenimiento.
            </div>
          </div>

          {/* 2. INSUMOS Y PRODUCCIÓN */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl">
                  Insumos & Producción
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.produccion.count} gastos
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-900">
                ${expenseBreakdown.produccion.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-emerald-800">{expenseBreakdown.produccion.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Compra de materia prima, carnes, verde, harina, quesos y descartables.
            </div>
          </div>

          {/* 3. PAGO A SOCIOS (TOTAL CONSOLIDADO) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-fuchsia-100 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-fuchsia-50 rounded-full pointer-events-none opacity-60" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-wider text-fuchsia-800 bg-fuchsia-50 px-3 py-1 rounded-xl">
                  Total Pago a Socios
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {expenseBreakdown.totalSocios.count} retiros
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-fuchsia-900">
                ${expenseBreakdown.totalSocios.total.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-1">
                Representa el <strong className="text-fuchsia-800">{expenseBreakdown.totalSocios.pct.toFixed(1)}%</strong> del total de egresos.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
              Retiros y anticipos de utilidades distribuidos entre socios.
            </div>
          </div>
        </div>

        {/* DESGLOSE ESPECÍFICO DE SOCIOS: SOCIO 1, SOCIO 2, SOCIO 3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-fuchsia-600" /> Desglose Detallado por Socio
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Valores individuales acumulados entregados a Socio 1, Socio 2 y Socio 3.
              </p>
            </div>
            <span className="text-xs font-black bg-fuchsia-50 text-fuchsia-800 px-3 py-1.5 rounded-xl border border-fuchsia-200">
              Total Socios: ${expenseBreakdown.totalSocios.total.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Socio 1 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-50/70 to-pink-50/20 border border-pink-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase text-pink-700 bg-pink-100 px-2.5 py-1 rounded-lg">
                  Socio 1
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  {expenseBreakdown.socios.socio1.count} entregas
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-pink-900 mt-2">
                ${expenseBreakdown.socios.socio1.total.toFixed(2)}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-600">
                <span>Participación:</span>
                <span className="text-pink-700 font-black">
                  {expenseBreakdown.socios.socio1.pctOfSocios.toFixed(1)}% del total socios
                </span>
              </div>
              <div className="w-full bg-pink-200/50 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-pink-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, expenseBreakdown.socios.socio1.pctOfSocios)}%` }} 
                />
              </div>
            </div>

            {/* Socio 2 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-purple-50/20 border border-purple-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                  Socio 2
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  {expenseBreakdown.socios.socio2.count} entregas
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-900 mt-2">
                ${expenseBreakdown.socios.socio2.total.toFixed(2)}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-600">
                <span>Participación:</span>
                <span className="text-purple-700 font-black">
                  {expenseBreakdown.socios.socio2.pctOfSocios.toFixed(1)}% del total socios
                </span>
              </div>
              <div className="w-full bg-purple-200/50 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, expenseBreakdown.socios.socio2.pctOfSocios)}%` }} 
                />
              </div>
            </div>

            {/* Socio 3 */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50/70 to-violet-50/20 border border-violet-100">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase text-violet-700 bg-violet-100 px-2.5 py-1 rounded-lg">
                  Socio 3
                </span>
                <span className="text-[11px] font-bold text-gray-400">
                  {expenseBreakdown.socios.socio3.count} entregas
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-violet-900 mt-2">
                ${expenseBreakdown.socios.socio3.total.toFixed(2)}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-bold text-gray-600">
                <span>Participación:</span>
                <span className="text-violet-700 font-black">
                  {expenseBreakdown.socios.socio3.pctOfSocios.toFixed(1)}% del total socios
                </span>
              </div>
              <div className="w-full bg-violet-200/50 h-2 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-violet-600 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, expenseBreakdown.socios.socio3.pctOfSocios)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* PIE CHART: DISTRIBUCIÓN VISUAL DE GASTOS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="font-black text-base text-gray-900">Gráfico de Distribución Porcentual</h4>
              <p className="text-xs text-gray-500">Proporción de gastos por rubro</p>
            </div>

            <div className="h-[280px] w-full flex items-center justify-center">
              {expensePieData.length === 0 ? (
                <div className="text-center text-gray-400 text-xs">
                  No hay gastos para mostrar en el gráfico circular.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {expensePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Monto']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Detailed Summary Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="font-black text-base text-gray-900">Resumen Consolidado de Egresos</h4>
              <p className="text-xs text-gray-500">Monto exacto y porcentaje de cada categoría</p>
            </div>

            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[280px]">
              <div className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-bold text-gray-700">Gasto Operativo</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900">${expenseBreakdown.operativo.total.toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.operativo.pct.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-gray-700">Insumos y Producción</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900">${expenseBreakdown.produccion.total.toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.produccion.pct.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                  <span className="font-bold text-gray-700">Pago Socio 1</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900">${expenseBreakdown.socios.socio1.total.toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.socios.socio1.pctOfTotal.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                  <span className="font-bold text-gray-700">Pago Socio 2</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900">${expenseBreakdown.socios.socio2.total.toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.socios.socio2.pctOfTotal.toFixed(1)}%)</span>
                </div>
              </div>

              <div className="py-2.5 flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-violet-500 shrink-0" />
                  <span className="font-bold text-gray-700">Pago Socio 3</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-gray-900">${expenseBreakdown.socios.socio3.total.toFixed(2)}</span>
                  <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.socios.socio3.pctOfTotal.toFixed(1)}%)</span>
                </div>
              </div>

              {expenseBreakdown.servicios.total > 0 && (
                <div className="py-2.5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                    <span className="font-bold text-gray-700">Servicios Básicos</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900">${expenseBreakdown.servicios.total.toFixed(2)}</span>
                    <span className="text-gray-400 text-[10px] ml-1.5">({expenseBreakdown.servicios.pct.toFixed(1)}%)</span>
                  </div>
                </div>
              )}

              <div className="pt-3 flex justify-between items-center text-sm font-black border-t border-gray-200">
                <span className="text-gray-900 uppercase">Total Egresos</span>
                <span className="text-red-600">${totalGastosMonto.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: ¿Cómo nos conocieron los clientes? (Encuesta de Origen) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-lg text-gray-900 uppercase tracking-tight">
                  Canales de Llegada de Clientes (Encuesta Web)
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Respuestas recopiladas sobre cómo los clientes descubrieron Empatuca
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-full text-xs font-black uppercase">
              Total respuestas: {(Object.values(origenStats) as number[]).reduce((a: number, b: number) => a + Number(b), 0)}
            </span>
          </div>

          {Object.keys(origenStats).length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              Aún no hay respuestas registradas. La encuesta activa en el sitio web recopilará las respuestas automáticamente.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.entries(origenStats) as [string, number][])
                .sort(([, a], [, b]) => Number(b) - Number(a))
                .map(([canal, count]) => {
                  const totalAnswers = (Object.values(origenStats) as number[]).reduce((a: number, b: number) => a + Number(b), 0);
                  const pct = totalAnswers > 0 ? ((Number(count) / totalAnswers) * 100).toFixed(1) : '0';
                  return (
                    <div 
                      key={canal} 
                      className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/70 flex items-center justify-between"
                    >
                      <div className="space-y-0.5 pr-2">
                        <p className="font-bold text-gray-800 text-xs leading-tight">
                          {canal}
                        </p>
                        <p className="text-[11px] text-gray-500 font-semibold">
                          {pct}% del total
                        </p>
                      </div>
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500 text-gray-950 font-black text-xs shrink-0 shadow-sm">
                        {count} {count === 1 ? 'voto' : 'votos'}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
