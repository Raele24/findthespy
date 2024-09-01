import { Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { RoomComponent } from './room/room.component';
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'error', component: ErrorComponent },
    { path: 'home', component: HomeComponent },
    { path: 'room/:id', component: RoomComponent },
    { path: 'game/:id/:gameId', component: GameComponent }
];
