import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  DashboardResponse,
  OrderStatusEntry
} from '../../models/dashboard.model';

import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    ProgressSpinnerModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeAdmin implements OnInit {

  private http = inject(HttpClient);

  loading = true;

  totalRevenue = 0;
  totalOrders = 0;
  pendingOrders = 0;
  totalUsers = 0;
  totalBooks = 0;

  labels: string[] = [];
  chartData: any;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      x: { ticks: { maxRotation: 90, minRotation: 45 } }
    }
  };

  // Signal for API request
  private dashboardSig = toSignal(
    this.http.get<DashboardResponse>(`${environment.apiUrl}/api/admin/dashboard`),
    { initialValue: null }
  );

  
  private dashboardEffect = effect(() => {
    const data = this.dashboardSig();
    if (!data) return;

    this.totalRevenue = data.totalRevenueLast30Days;
    this.totalOrders = data.totalOrdersLast30Days;
    this.pendingOrders = data.pendingOrders;
    this.totalUsers = data.totalUsers;
    this.totalBooks = data.totalBooks;

    const statuses = ['pending', 'shipped', 'completed', 'canceled'];

    const datasets = statuses.map(status => {
      const values = this.mapStatusDataToArray(
        data.ordersByStatus?.[status] ?? [],
        this.labels
      );

      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        data: values,
        borderColor: this.mapStatusColor(status),
        backgroundColor: this.mapStatusColor(status),
        fill: false,
        tension: 0.3
      };
    });

    this.chartData = {
      labels: this.labels,
      datasets
    };

    this.loading = false;
  });

  constructor() {}

  ngOnInit() {
    this.labels = this.generateLast30DaysLabels();
  }

  generateLast30DaysLabels(): string[] {
    const list: string[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');

      list.push(`${y}-${m}-${da}`);
    }

    return list;
  }

  mapStatusDataToArray(statusData: OrderStatusEntry[], labels: string[]): number[] {
    const lookup = new Map<string, number>();

    statusData.forEach(entry => lookup.set(entry.date, entry.count));

    return labels.map(date => lookup.get(date) ?? 0);
  }

  mapStatusColor(status: string): string {
    switch (status) {
      case 'pending': return '#fbc02d';
      case 'shipped': return '#29b6f6';
      case 'completed': return '#66bb6a';
      case 'canceled': return '#ef5350';
      default: return '#9e9e9e';
    }
  }

}
