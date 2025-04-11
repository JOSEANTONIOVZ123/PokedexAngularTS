import { InformacionComponent } from './informacion/informacion.component';
import { Routes } from '@angular/router';
import { PokemonComponent } from './components/pokemon/pokemon.component';

export const routes: Routes = [
{path: '', component: PokemonComponent},
{path: 'informacion/:name', component: InformacionComponent},

];
