import { Injectable, computed, inject } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  // FIX: Explicitly type the injected ActivatedRoute to resolve 'unknown' type error.
  private route: ActivatedRoute = inject(ActivatedRoute);

  // Reactively tracks the 'admin' query parameter from the URL.
  private adminQueryParam = toSignal(
    // Fix: Explicitly type params as ParamMap to resolve property access error.
    this.route.queryParamMap.pipe(map((params: ParamMap) => params.get('admin')))
  );

  /**
   * A computed signal that is `true` if the URL contains `?admin=true`.
   * This signal is used throughout the application to toggle admin-only UI.
   */
  isAdmin = computed(() => this.adminQueryParam() === 'true');
}
