import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuditLogService, AuditLog } from '../../core/services/audit-log';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private auditLogService = inject(AuditLogService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  logs: AuditLog[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading = true;
    this.error = '';
    this.cdr.detectChanges();

    this.auditLogService.getAllLogs().subscribe({
      next: (data) => {
        console.log('Audit logs received:', data);
        this.logs = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load audit logs:', error);
        this.logs = [];
        this.loading = false;
        this.error = 'Unable to load audit logs';
        this.cdr.detectChanges();
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToDocuments(): void {
    this.router.navigate(['/documents']);
  }

  goToCategories(): void {
    this.router.navigate(['/categories']);
  }

  refreshLogs(): void {
    this.loadLogs();
  }
}
