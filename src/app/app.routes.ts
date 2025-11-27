import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { Shop } from './shop/shop';
import { Cart } from './cart/cart';
import { Checkout } from './checkout/checkout';
import { OrderSuccess } from './order-success/order-success';
import { MyOrders } from './my-orders/my-orders';
import { AdminDashboard } from './admin/dashboard/dashboard';
import { AdminBooks } from './admin/books/books';
import { AdminUsers } from './admin/users/users';
import { AdminOrders } from './admin/orders/orders';
import { HomeAdmin } from './admin/home/home';
import { AdminMessages } from './admin/messages/messages';
import { Settings } from './settings/settings';
import { Contact } from './contact/contact';
import { Wishlist } from './wishlist/wishlist';
import { AuthGuard } from './auth/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'shop', component: Shop },
  { path: 'cart', component: Cart },
  { path: 'settings', component: Settings },
  { path: 'contact', component: Contact },
  { path: 'checkout', component: Checkout, canActivate: [AuthGuard]  },
  { path: 'order-success', component: OrderSuccess },
  { path: 'wishlist', component: Wishlist, canActivate: [AuthGuard] },
  {
    path: 'my-orders',
    component: MyOrders,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin',
    component: AdminDashboard,
    canActivate: [AdminGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeAdmin },
      { path: 'books', component: AdminBooks },
      { path: 'users', component: AdminUsers },
      { path: 'orders', component: AdminOrders },
      { path: 'messages', component: AdminMessages }
    ]
  },
  { path: '**', redirectTo: '' }
];