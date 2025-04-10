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
  styleUrls: ['./pokemon.component.css']
})
export class PokemonComponent implements OnInit {
  listaPokemon: Pokemon[] = [];
  listaPrimera: Pokemon[] = [];
  listaTipos: Pokemon[] = [];
  buscador: string = ""; // para el ngModule
  mostrarBrillantes = false;
  mostrarLegendarios = false;
  mostrarMitico= false;
  listaPokemonOriginal: Pokemon[] = [];
  arriba: string = '';

  constructor(private pokemonService: PokemonService) {}

  // Inicializa el componente
  ngOnInit(): void {
    this.listaPokemons();
  }

  // Función para mostrar los 151 Pokémon o los que haya
  listaPokemons() {
      this.pokemonService.listaPokemon(151).subscribe(pokemon => {
        // Se guarda la lista original y la de la primera carga
        this.listaPrimera = pokemon;
        this.listaPokemonOriginal = pokemon;
        this.arriba = "Todos";
        //para quitar los pokemon que no tiene imagen
        this.listaPokemon = this.filtrarConImagen(pokemon);
        if (this.mostrarLegendarios) {
          //filtro de legendarios
           const requests = pokemon.map(p =>
             this.pokemonService.pokemonLegendarios(p.id).pipe(
               catchError(() => of(null))
             )
           );

           forkJoin(requests).subscribe(lista => {
             const legendarios = lista
               .map((data, index) => ({
                 isLegendary: data?.is_legendary,
                 pokemon: pokemon[index]
               }))
               .filter(item => item.isLegendary)
               .map(item => item.pokemon);

             this.listaPokemon = this.filtrarConImagen(legendarios);
             this.listaPokemonOriginal = legendarios;
           });
         } else {
           // Si no filtra legendarios, se muestran todos con imagen
           this.listaPokemon = this.filtrarConImagen(pokemon);
         }

      });
  }

  // Función para buscar un Pokémon por nombre
  buscarPorNombre(valor: string) {
    const nombre = valor.trim().toLowerCase();
    if (!nombre) {
      this.listaPokemon = this.filtrarConImagen(this.listaPokemonOriginal);
      return;
    }
    this.listaPokemon = this.filtrarConImagen(
      this.listaPokemonOriginal.filter(p =>
        p.name.toLowerCase().includes(nombre)
      )
    );
  }

  // Función para mostrar Pokémon por tipo
  botonesTipos(valor: string) {
    this.pokemonService.listaPokemonTipo(valor).subscribe(pokemon => {
      this.listaTipos = pokemon;
      this.listaPokemonOriginal = pokemon;
      this.arriba = valor;

      if (this.mostrarLegendarios) {
       //filtro de legendarios
        const requests = pokemon.map(p =>
          this.pokemonService.pokemonLegendarios(p.id).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(requests).subscribe(lista => {
          const legendarios = lista
            .map((data, index) => ({
              isLegendary: data?.is_legendary,
              pokemon: pokemon[index]
            }))
            .filter(item => item.isLegendary)
            .map(item => item.pokemon);

          this.listaPokemon = this.filtrarConImagen(legendarios);
          this.listaPokemonOriginal = legendarios;
        });
      } else if (this.mostrarMitico) {
        //filtro de legendarios
         const requests = pokemon.map(p =>
           this.pokemonService.pokemonLegendarios(p.id).pipe(
             catchError(() => of(null))
           )
         );

         forkJoin(requests).subscribe(lista => {
           const legendarios = lista
             .map((data, index) => ({
               isMitical: data?.is_mythical,
               pokemon: pokemon[index]
             }))
             .filter(item => item.isMitical)
             .map(item => item.pokemon);

           this.listaPokemon = this.filtrarConImagen(legendarios);
           this.listaPokemonOriginal = legendarios;
         });
        }else {
        // Si no filtra legendarios, se muestran todos con imagen
        this.listaPokemon = this.filtrarConImagen(pokemon);
      }


    });
  }

  // Función para mostrar los SHINYYYYY!!!!
  Mostrarshiny() {
    this.mostrarBrillantes = !this.mostrarBrillantes;
  }

  // Función para filtrar Pokémon legendarios
  botonLegendario() {
    this.mostrarLegendarios = !this.mostrarLegendarios;

    if (this.mostrarLegendarios === true) {
      const requests = this.listaPokemonOriginal.map(p =>
        this.pokemonService.pokemonLegendarios(p.id).pipe(
          catchError(() => of(null))
        )
      );

      forkJoin(requests).subscribe(lista => {
        const legendarios = lista
          .map((data, index) => ({
            isLegendary: data?.is_legendary,
            pokemon: this.listaPokemonOriginal[index]
          }))
          .filter(item => item.isLegendary)
          .map(item => item.pokemon);

        this.listaPokemon = this.filtrarConImagen(legendarios);
        this.listaPokemonOriginal = legendarios;
      });
    } else {
      // Al desactivar el filtro, se restablece la lista según el contexto
      if (this.arriba === 'Todos') {
        this.listaPokemon = this.filtrarConImagen(this.listaPrimera);
        this.listaPokemonOriginal = this.listaPrimera;
      } else {
        this.listaPokemon = this.filtrarConImagen(this.listaTipos);
        this.listaPokemonOriginal = this.listaTipos;
      }
    }
  }

  // Traducciones de tipos
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

  // Traducciones de estadísticas
  statTraducida: { [key: string]: string } = {
    hp: 'PS',
    attack: 'Ataque',
    defense: 'Defensa',
    'special-attack': 'Ataque Esp',
    'special-defense': 'Defensa Esp',
    speed: 'Velocidad'
  };

  // Función para filtrar los Pokémon que no tienen imagen válida
  filtrarConImagen(lista: Pokemon[]): Pokemon[] {
    return lista.filter(pokemon =>
      pokemon.image && pokemon.image.trim() !== '' && !pokemon.image.includes('undefined')
    );
  }

  //misma funcion que el botonLegendario
  pokemonMitico(){


    this.mostrarMitico = !this.mostrarMitico;

    if (this.mostrarMitico === true) {
      const requests = this.listaPokemonOriginal.map(p =>
        this.pokemonService.pokemonLegendarios(p.id).pipe(
          catchError(() => of(null))
        )
      );

      forkJoin(requests).subscribe(lista => {
        const legendarios = lista
          .map((data, index) => ({
            isMitical: data?.is_mythical,
            pokemon: this.listaPokemonOriginal[index]
          }))
          .filter(item => item.isMitical)
          .map(item => item.pokemon);

        this.listaPokemon = this.filtrarConImagen(legendarios);
        this.listaPokemonOriginal = legendarios;
      });
    } else {
      // Al desactivar el filtro, se restablece la lista según el contexto
      if (this.arriba === 'Todos') {
        this.listaPokemon = this.filtrarConImagen(this.listaPrimera);
        this.listaPokemonOriginal = this.listaPrimera;
      } else {
        this.listaPokemon = this.filtrarConImagen(this.listaTipos);
        this.listaPokemonOriginal = this.listaTipos;
      }
    }
  }











}
