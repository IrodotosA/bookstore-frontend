import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Shop } from './shop/shop';
import { Cart } from './cart/cart';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'shop', component: Shop },
  { path: 'cart', component: Cart },
  { path: '**', redirectTo: '' }
];