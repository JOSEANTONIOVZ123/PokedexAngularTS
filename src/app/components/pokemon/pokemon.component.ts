import { Component, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { Pokemon } from '../../model/pokemon.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-pokemon',
  imports: [CommonModule, FormsModule],
  templateUrl: './pokemon.component.html',
  styleUrl: './pokemon.component.css'
})
export class PokemonComponent implements OnInit {
  listaPokemon: Pokemon[] = [];
  listaPrimera: Pokemon[] =[];
  listaTipos: Pokemon[] =[];
  buscador: string=""; // para el ngModule
  mostrarBrillantes=false;
  mostrarLegendarios=false;
  listaPokemonOriginal: Pokemon[] = [];
  arriba:string='';
  constructor(private pokemonService: PokemonService) {}

  //para inicializarlo nada mas empezar
  ngOnInit(): void {
    this.listaPokemons();
  }

  //funcion para mostrar los 151 pokemons o los que haya
  listaPokemons() {
    if (this.listaPrimera.length === 0) {
      this.pokemonService.listaPokemon(10000000).subscribe(pokemon => {
        this.listaPokemon = pokemon;
        this.listaPokemonOriginal = pokemon;
        this.listaPrimera = pokemon;
        this.arriba = "Todos";
      });
    } else {
      this.listaPokemon = this.listaPrimera;
      this.listaPokemonOriginal = this.listaPrimera;
      this.arriba = "Todos";
    }
  }



  //funcion para cuando le llegue un registro busque un pokemon por nombre
  buscarPorNombre(valor:string){
    //primero evitamos las mayusculas y los espacios
    const nombre = valor.trim().toLowerCase();
    //si no devuelve nada no escribe nada
    if (!nombre){
      this.listaPokemon=this.listaPokemonOriginal;
      return;

    }
    //con esto saco un pokemon por su nombre y todas sus estadisticas

    this.listaPokemon = this.listaPokemonOriginal.filter(p =>
      p.name.toLowerCase().includes(nombre)

    );
    // this.pokemonService.pokemonPorNombre(nombre).subscribe({
    //   next: (pokemon: Pokemon) => {
    //     this.listaPokemon = [pokemon];
    //   }
    // });
  }


  //funcion botones por tipos
  botonesTipos(valor: string) {
    this.pokemonService.listaPokemonTipo(valor).subscribe(pokemon => {
      this.listaTipos = pokemon;
      this.listaPokemonOriginal = pokemon;
      this.arriba = valor;

      if (this.mostrarLegendarios) {
        const requests = pokemon.map(p =>
          this.pokemonService.pokemonLegendarios(p.id).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(requests).subscribe(speciesList => {
          const legendarios = speciesList
            .map((data, index) => ({
              isLegendary: data?.is_legendary,
              pokemon: pokemon[index]
            }))
            .filter(item => item.isLegendary)
            .map(item => item.pokemon);

          this.listaPokemon = legendarios;
          this.listaPokemonOriginal = legendarios;
        });
      } else {
        this.listaPokemon = pokemon;
      }
    });
  }



  //
    Mostrarshiny() {
      this.mostrarBrillantes=!this.mostrarBrillantes
  }


  botonLegendario() {
      this.mostrarLegendarios=!this.mostrarLegendarios


    if (this.mostrarLegendarios==true) {
    const requests = this.listaPokemonOriginal.map(p =>
      this.pokemonService.pokemonLegendarios(p.id).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(requests).subscribe(speciesList => {
      const legendarios = speciesList
        .map((data, index) => ({
          isLegendary: data?.is_legendary,
          pokemon: this.listaPokemonOriginal[index]
        }))
        .filter(item => item.isLegendary)
        .map(item => item.pokemon);

      this.listaPokemon = legendarios;
      this.listaPokemonOriginal = legendarios;

    });


    }else{
      if (this.arriba == 'Todos') {
        this.listaPokemon=this.listaPrimera
      }else{
        this.listaPokemon = this.listaTipos;
      }
    }
  }






  //para las traducciones
  tipoTraducido: { [key: string]: string } = {
    grass: 'Planta',
    fire: 'Fuego',
    water: 'Agua',
    bug: 'Bicho',
    normal: 'Normal',
    flying: 'Aire',
    poison: 'Veneno',
    electric: 'Eléctrico',
    ground: 'Tierra',
    fairy: 'Hada',
    fighting: 'Lucha',
    psychic: 'Psíquico',
    rock: 'Roca',
    ice: 'Hielo',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero'
  };

  statTraducida: { [key: string]: string } = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp',
    'special-defense': 'Defensa Esp',
    speed: 'Velocidad'
  };




}
