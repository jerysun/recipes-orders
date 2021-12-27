import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { DataStorageService } from '../shared/data-storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  private authSub: Subscription;

  constructor(private dataStorageService: DataStorageService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user.subscribe(user => this.isAuthenticated = user.token != null);
  }

  onSaveData(): void {
    this.dataStorageService.storeRecipes();
  }

  onFetchData(): void {
    this.authSub = this.dataStorageService.fetchRecipes().subscribe();
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }
}
