import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, BarChart3, PieChart, DollarSign } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DashboardCharts = ({ orders, products, categories }) => {
  // Prepare real monthly sales data from orders
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentDate = new Date();
    const last6Months = [];
    const salesData = [];

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      last6Months.push(months[date.getMonth()]);

      // Calculate real sales for this month
      const monthOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === date.getMonth() &&
               orderDate.getFullYear() === date.getFullYear() &&
               order.status !== 'cancelled';
      });

      const monthlyRevenue = monthOrders.reduce((sum, order) => sum + (Number(order.total_price) || 0), 0);
      salesData.push(monthlyRevenue);
    }

    return { labels: last6Months, data: salesData };
  };

  const monthlyData = getMonthlyData();

  // Sales Chart Data with real data
  const salesData = {
    labels: monthlyData.labels,
    datasets: [
      {
        label: 'Penjualan (Rp)',
        data: monthlyData.data,
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(102, 126, 234)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  // Products by Category Chart with real data
  const getCategoryStats = () => {
    if (!categories || !products) return { labels: [], data: [] };

    const categoryData = categories.map(cat => {
      const count = products.filter(product =>
        product.category_id === cat.id
      ).length;
      return count;
    });

    return {
      labels: categories.map(cat => cat.category_name || cat.name),
      data: categoryData
    };
  };

  const categoryStats = getCategoryStats();

  const categoryChartData = {
    labels: categoryStats.labels,
    datasets: [
      {
        label: 'Jumlah Produk',
        data: categoryStats.data,
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(102, 126, 234)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Order Status Chart with real data
  const getOrderStatusData = () => {
    if (!orders || orders.length === 0) {
      return { labels: [], data: [] };
    }

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      if (statusCounts.hasOwnProperty(order.status)) {
        statusCounts[order.status]++;
      }
    });

    return {
      labels: ['Pending', 'Dikonfirmasi', 'Dikirim', 'Selesai', 'Dibatalkan'],
      data: [
        statusCounts.pending,
        statusCounts.confirmed,
        statusCounts.shipped,
        statusCounts.delivered,
        statusCounts.cancelled
      ]
    };
  };

  const orderStatusData = getOrderStatusData();

  const orderStatusChartData = {
    labels: orderStatusData.labels,
    datasets: [
      {
        data: orderStatusData.data,
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(102, 126, 234, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(102, 126, 234)',
          'rgb(16, 185, 129)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Penjualan (Rp)') {
              return `Penjualan: Rp ${context.parsed.y.toLocaleString('id-ID')}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            if (value >= 1000000) {
              return 'Rp ' + (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return 'Rp ' + (value / 1000).toFixed(0) + 'K';
            }
            return 'Rp ' + value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(102, 126, 234, 0.8)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    cutout: '60%',
  };

  // Calculate real revenue stats
  const totalRevenue = monthlyData.data.reduce((a, b) => a + b, 0);
  const avgMonthlyRevenue = totalRevenue / 6;
  const bestMonth = monthlyData.labels[monthlyData.data.indexOf(Math.max(...monthlyData.data))];

  // Calculate growth rate (current month vs previous month)
  const currentMonth = monthlyData.data[monthlyData.data.length - 1] || 0;
  const previousMonth = monthlyData.data[monthlyData.data.length - 2] || 0;
  const growthRate = previousMonth > 0 ? ((currentMonth - previousMonth) / previousMonth * 100) : 0;

  return (
    <div className="dashboard-charts">
      <div className="charts-container">
        {/* Sales Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-header-icon">
              <TrendingUp size={20} />
            </div>
            <div className="chart-header-content">
              <h3>Trend Penjualan</h3>
              <p>Penjualan 6 bulan terakhir</p>
            </div>
          </div>
          <div className="chart-content">
            <Line data={salesData} options={chartOptions} />
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-header-icon">
              <PieChart size={20} />
            </div>
            <div className="chart-header-content">
              <h3>Status Pesanan</h3>
              <p>Distribusi status pesanan</p>
            </div>
          </div>
          <div className="chart-content">
            <Doughnut data={orderStatusChartData} options={doughnutOptions} />
          </div>
        </div>

        {/* Products by Category Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-header-icon">
              <BarChart3 size={20} />
            </div>
            <div className="chart-header-content">
              <h3>Produk per Kategori</h3>
              <p>Jumlah produk dalam setiap kategori</p>
            </div>
          </div>
          <div className="chart-content">
            <Bar data={categoryChartData} options={chartOptions} />
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-header-icon">
              <DollarSign size={20} />
            </div>
            <div className="chart-header-content">
              <h3>Ringkasan Pendapatan</h3>
              <p>Analisis pendapatan real</p>
            </div>
          </div>
          <div className="revenue-stats">
            <div className="revenue-item">
              <div className="revenue-label">Total Pendapatan</div>
              <div className="revenue-value">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Rata-rata per Bulan</div>
              <div className="revenue-value">
                Rp {Math.round(avgMonthlyRevenue).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Bulan Terbaik</div>
              <div className="revenue-value">
                {bestMonth || 'Belum ada data'}
              </div>
            </div>
            <div className="revenue-item">
              <div className="revenue-label">Pertumbuhan</div>
              <div className={`revenue-value ${growthRate >= 0 ? 'growth-positive' : 'growth-negative'}`}>
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
