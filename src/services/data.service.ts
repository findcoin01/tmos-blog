import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Post } from '../models/post.model';
import { AppData, GalleryImage, Friend, AboutInfo, SiteStats, Quote, HomePageConfig } from '../models/app-data.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // FIX: Explicitly type the injected HttpClient to resolve 'unknown' type error.
  private http: HttpClient = inject(HttpClient);
  private data$: Observable<AppData> = this.http.get<AppData>('src/assets/db.json').pipe(
    shareReplay(1) // Cache the response to avoid multiple HTTP requests
  );

  getPosts(): Observable<Post[]> {
    return this.data$.pipe(map(data => data.posts));
  }

  getGalleryImages(): Observable<GalleryImage[]> {
    return this.data$.pipe(map(data => data.gallery));
  }

  getFriends(): Observable<Friend[]> {
    return this.data$.pipe(map(data => data.friends));
  }

  getAboutInfo(): Observable<AboutInfo> {
    return this.data$.pipe(map(data => data.about));
  }

  getSiteStats(): Observable<SiteStats> {
    return this.data$.pipe(map(data => data.siteStats));
  }
  
  getHomePageConfig(): Observable<HomePageConfig> {
    return this.data$.pipe(map(data => data.homePageConfig));
  }

  getQuotes(): Observable<Quote[]> {
    return this.data$.pipe(map(data => data.quotes));
  }
}