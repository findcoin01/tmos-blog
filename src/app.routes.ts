import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { AboutComponent } from './pages/about/about.component';
import { PostComponent } from './pages/post/post.component';
import { ArchiveComponent } from './pages/archive/archive.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { FriendsComponent } from './pages/friends/friends.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent, title: '首页 | TMOS' },
  { path: 'articles', component: ArticlesComponent, title: '文章 | TMOS' },
  { path: 'gallery', component: GalleryComponent, title: '相册 | TMOS' },
  { path: 'archive', component: ArchiveComponent, title: '归档 | TMOS' },
  { path: 'friends', component: FriendsComponent, title: '友链 | TMOS' },
  { path: 'about', component: AboutComponent, title: '关于 | TMOS' },
  { path: 'post/:id', component: PostComponent, title: '文章详情 | TMOS' },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' } // Fallback route
];